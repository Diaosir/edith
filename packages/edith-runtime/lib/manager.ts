import File, { FileType } from 'edith-types/lib/file';
import Module from './module'
import Packager from './packager'
import * as path from 'path';
import ClientWebpack from '..';
import { normalize, isNodeModules } from '@/utils/path';
import * as Loading from '@/components/Loading';
import Log from './Log'
import FileService from '../services/file/fileService';
import { URI } from './Uri';
function resolve(from: string, to: string) {
  //Todo 判断是否为文件或者文件夹
  const { ext } = path.parse(from);
  return path.resolve(!!ext ? path.resolve(from, '..') : from, to)
}
export const isDir = (filepath) => {
    const { ext } = path.parse(filepath);
    return !ext
}
/**
 * 编译阶段
 */
export default class Manager {
  public static clientWebpack: any = ClientWebpack;
  public static transpilerModules: Map<string, Module> = new Map();
  public static denpenciesIdMap: Map<string, string> = new Map();
  public static packager: Packager;
  public static entryTanspilerModule: Module;
  public static projectName: string;
  public static loadingComponent: any = Loading;
  public static log: Log = new Log();
  public static globalModules: Map<string, any> = new Map(); //全局模块一个变量
  public static fileService = new FileService();
  constructor(packaker: Packager) {
    Manager.packager = packaker;
    // Manager.globalModules.set('react', react);
    // Manager.globalModules.set('react-dom', ReactDOM);
  }
  public async init(projectName: string, code: string, filePath: string) {
    Manager.projectName = projectName;
    let now = Date.now();
    console.log(filePath)
    Manager.entryTanspilerModule = await Manager.traverse(code, filePath);
    console.log('查找依赖花了: ' + (Date.now() - now) / 1000 + 's')
    now = Date.now()
    console.log(Manager.transpilerModules)
    now = Date.now()
    Manager.traverseExecute(Manager.entryTanspilerModule);
    console.log('执行代码花了: ' + (Date.now() - now) / 1000 + 's');
  }
  /**
   * 递归编译入口文件找到所有依赖文件
   * @param entryFile
   */
  public static async traverse(code: string, filePath: string, parentTranspilerPath?: string, __module__export: any = null) {
    
    const module = Manager.transpilerModules.get(normalize(filePath)) || new Module({code, path: normalize(filePath), module: __module__export, resource: URI.parse(`localFs:${filePath}`)});
    // transpiler.code = code;

    const parentTranspilerTpye = File.filenameToFileType(parentTranspilerPath);
    if (module.path) {
      Manager.transpilerModules.set(module.path, module);

      if (parentTranspilerPath) {
        module.addParent(parentTranspilerPath);
      }
      if (![FileType.LESS, FileType.SCSS].includes(parentTranspilerTpye) && [FileType.CSS, FileType.LESS, FileType.SCSS].includes(module.type)) {
        module.isEntry = true;
      }
    }
    if (!module.isTraverse) {
      module.isTraverse = true;
      await module.translate();
    }
    return module;
  }
  public static async traverseChildren(parentTranspilerPath: string, moduleName: string) {
    const parentModule = Manager.getTranspilerModuleByPath(parentTranspilerPath);
    const basePath = parentModule.path;
    let filename = ''
    let childrenModule: Module = null, code = '', uri: URI = null;
    const node_modules_path = path.join('/', Manager.projectName, 'node_modules');
    //如果有全局模块，则直接返回全局变量，新建transpilerModule；
    if(Manager.globalModules.get(moduleName)) { 
      filename = `/node_modules/${moduleName}`, code = '';
      childrenModule = await Manager.traverse(code, filename, parentModule.path, Manager.globalModules.get(moduleName))
    } else {
      uri = URI.parse(`localFs:${moduleName}`)
      filename = await Manager.fileService.resolve(uri, URI.parse(`localFs:${parentTranspilerPath}`), node_modules_path);
      // if(filename) {
      //   // const { code: localCode } = await Manager.fileService.readFile(uri.with({
      //   //   path: filename
      //   // }));
      //   code = localCode
      // }
      //TODO 本地拿不到，需要去远程获取文件 
      if(!filename) {
        console.log(filename, uri.fsPath, parentModule.path)
        if (isNodeModules(moduleName) && ![FileType.LESS, FileType.SCSS, FileType.CSS].includes(parentModule.type)) {
          filename = path.join(node_modules_path, moduleName);
        } else {
          filename = resolve(basePath, moduleName);
        }
        const packageFile = await Manager.packager.getPackageFileOnlyPath(filename);
        code = packageFile.code;
        filename = packageFile.fullPath;
      }
      childrenModule = await Manager.traverse(code, filename, parentModule.path);
    }
    if (childrenModule && childrenModule.path) {
      parentModule.addDenpency(moduleName ,childrenModule.path);
      Manager.setDenpenciesIdMap(basePath, moduleName, childrenModule.path);
    }
  }
  /**
   * 修改模块代码
   */
  public static async rebuildTranspilerModule(path: string) {
    const targetTranspilerModule = Manager.getTranspilerModuleByPath(path);
    if (!!targetTranspilerModule) {
      Manager.loadingComponent.show()
      try {
        const now = Date.now();
        await targetTranspilerModule.reset();
        
        if(File.isStyle(targetTranspilerModule.type) && !targetTranspilerModule.isEntry) {
          await Manager.translateAllStyleEntry(targetTranspilerModule.path);
        } else {
          await targetTranspilerModule.translate();
        }
        console.log(`重新编译，耗时${ (Date.now() - now) / 1000}s`)
        // console.log(Manager.transpilerModules)
        //如果改动的是样式文件则重现编译所有less文件
        Manager.traverseExecute(Manager.entryTanspilerModule);
        console.log(Manager.transpilerModules)
      } catch(error) {
        console.log(error)
      }
      Manager.loadingComponent.close()
    }
  }
  /**
   * 根据触发文件重新编译所有入口样式文件
   */
  public static async translateAllStyleEntry(triggerModulePath: string) {
    let translateStyleEntryPromises = [];
    Manager.transpilerModules.forEach((transpilerModule, transpilerModuleName) => {
      if (File.isStyle(transpilerModule.type) && transpilerModule.isEntry && transpilerModule.isIncludeChildren(triggerModulePath)) {
        translateStyleEntryPromises.push(transpilerModule.translate(true));
        console.log(`编译${transpilerModule.path}`)
      }
    })
    await Promise.all(translateStyleEntryPromises);
  }
  public static walk(entryTanspilerModulePath: string, callback: Function) {
    const entryTanspilerModule = Manager.getTranspilerModuleByPath(entryTanspilerModulePath);
    if (!!entryTanspilerModule) {
      if(callback(entryTanspilerModule)) {
        return;
      }
      const denpencies = entryTanspilerModule.getDenpencies()
      if(denpencies.length > 0) {
        denpencies.forEach(denpency => {
          Manager.walk(denpency, callback);
        })
      }
    } 
  }
  public static getTranspilerModuleByPath(path: string) {
    return Manager.transpilerModules.get(path) || null;
  }
  public static setDenpenciesIdMap(parentPath, filePath, transpilerModuleId) {
    Manager.denpenciesIdMap.set(`${parentPath}/${filePath}`, transpilerModuleId);
  }
  public static getDenpenciesIdMapValue(parentPath, filePath) {
    let result =  Manager.denpenciesIdMap.get(`${parentPath}/${filePath}`) || Manager.denpenciesIdMap.get(`${parentPath}${filePath}`) || null;
    return result
  }
  public static getChildrenDenpenciesIdMapValue(parentPath): Map<string, string> {
    let childrenMap = new Map();
    Manager.denpenciesIdMap.forEach((value, key) => {
      if (key.indexOf(parentPath) > -1) {
        childrenMap.set(key, value);
      }
    })
    return childrenMap;
  }
  public static traverseExecute(entryTanspilerModule: Module) {
    __edith_require__(entryTanspilerModule.path, true);
  }
  public static async setFileMap(filename, code) {
    await Manager.fileService.writeFile(URI.parse(`localFs:${filename}`), code);
    ClientWebpack.fileMap.set(filename, code);
  }
  /**
   *
   * 添加一个node_module包
   * @static
   * @param {{
   *     packageName: string, 
   *     version?: string,
   *     filename: string
   *   }} data
   * @memberof Transpiler
   */
  public static async loadNodeModuleFile(data: {
    name: string, 
    version?: string,
    filePath: string
  }) {
    return await Manager.packager.loadFile({
      name: data.name,
      version: data.version,
      filePath: data.filePath,
      projectName: Manager.projectName
    })
  }
  public static async addNodeModuleDependenies(denpencies: {
    [depName: string]: string
  }){
    await Manager.packager.addRootDependency(denpencies);
  }
  public static __edith_require__ = __edith_require__;
}
function __edith_require__(modulePath, isForce: boolean = false) {
  if(Manager.denpenciesIdMap.get(modulePath)) {
    modulePath = Manager.denpenciesIdMap.get(modulePath)
  };
  const transpilter = Manager.getTranspilerModuleByPath(modulePath);
  //TODO 判断是否取缓存数据
  if (modulePath.match(/node_modules/) && !isForce && transpilter.module.isLoad) {
    return transpilter.module.exports;
  }
  let module = {
      ...transpilter.module,
      isLoad: false,
      exports: {}
  }
  //解决循环依赖问题;
  module.isLoad = true;
  transpilter.module = module;
  
  try{
    transpilter.getModuleFunction().call(module.exports, module, module.exports, __edith_require__);

    //执行完成，清除编译后代码
    // transpilter.ctx.transpilingCode = ''
  } catch (error) {
    module.isLoad = false;
    // throw new Error(error)
    console.log(error)
  }
  return module.exports
}