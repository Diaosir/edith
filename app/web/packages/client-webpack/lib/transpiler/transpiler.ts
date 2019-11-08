import File, { FileType } from '@/datahub/project/entities/file';
import TranspilerModule from './transpiler-module'
import Packager from '../packager'
import BrowserFs from '@/packages/browserfs';
import * as path from 'path';
import ClientWebpack from '@/packages/client-webpack';
import { normalize, isNodeModules } from '@/utils/path';
import * as Loading from '@/components/Loading';
import Log from '../Log'
const global = window as { [key:string]: any};
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
export default class Transpiler {
  public static clientWebpack: any = ClientWebpack;
  public static transpilerModules: Map<string, TranspilerModule> = new Map();
  public static denpenciesIdMap: Map<string, string> = new Map();
  public static packager: Packager;
  public static entryTanspilerModule: TranspilerModule;
  public static projectName: string;
  public static loadingComponent: any = Loading;
  public static log: Log = new Log();
  constructor(packaker: Packager) {
    Transpiler.packager = packaker;
  }
  public async init(projectName: string, code: string, filePath: string) {
    Transpiler.projectName = projectName;
    let now = Date.now();
    Transpiler.entryTanspilerModule = await Transpiler.traverse(code, filePath);
    console.log('查找依赖花了: ' + (Date.now() - now) / 1000 + 's')
    now = Date.now()
    console.log(Transpiler.transpilerModules)
    now = Date.now()
    Transpiler.traverseExecute(Transpiler.entryTanspilerModule);
    console.log('执行代码花了: ' + (Date.now() - now) / 1000 + 's');
  
  }
  /**
   * 递归编译入口文件找到所有依赖文件
   * @param entryFile
   */
  public static async traverse(code: string, filePath: string, parentTranspilerPath?: string) {
    const transpiler = Transpiler.transpilerModules.get(normalize(filePath)) || new TranspilerModule({code, path: normalize(filePath)});
    // transpiler.code = code;

    const parentTranspilerTpye = File.filenameToFileType(parentTranspilerPath);

    if (transpiler.path) {
      Transpiler.transpilerModules.set(transpiler.path, transpiler);

      if (parentTranspilerPath) {
        transpiler.addParent(parentTranspilerPath);
      }
      if (![FileType.LESS, FileType.SCSS].includes(parentTranspilerTpye) && [FileType.CSS, FileType.LESS, FileType.SCSS].includes(transpiler.type)) {
        transpiler.isEntry = true;
      }
    }
    if (!transpiler.isTraverse) {
      transpiler.isTraverse = true;
      await transpiler.translate();
    }
    return transpiler;
  }
  public static async traverseChildren(parentTranspilerPath: string, moduleName: string) {
    const parentTranspiler = Transpiler.getTranspilerModuleByPath(parentTranspilerPath);
    const basePath = parentTranspiler.path;
    let filename = resolve(basePath, moduleName);
    const localFileInfo = await ClientWebpack.getFileContentByFilePath(filename);
    let childrenTranspiler= null, code = '';
    // TODO 判断获取node_modules还是本地文件
    if(localFileInfo.code !== undefined) {
      code = localFileInfo.code;
      filename = localFileInfo.fullPath
    } else {
      //排除node_modules中样式文件的引用路径，例如：@import 'a.less';
      if (isNodeModules(moduleName) && ![FileType.LESS, FileType.SCSS, FileType.CSS].includes(parentTranspiler.type)) {
        filename = path.join('/', Transpiler.projectName, 'node_modules', moduleName);
      }
      const packageFile = await Transpiler.packager.getPackageFileOnlyPath(filename);
      code = packageFile.code;
      filename = packageFile.fullPath;
    }
    childrenTranspiler = await Transpiler.traverse(code, filename, parentTranspiler.path);
    if (childrenTranspiler && childrenTranspiler.path) {
      parentTranspiler.addDenpency(moduleName ,childrenTranspiler.path);
      Transpiler.setDenpenciesIdMap(basePath, moduleName, childrenTranspiler.path);
    }
  }
  /**
   * 修改模块代码
   */
  public static async rebuildTranspilerModule(path: string, newCode: string) {
    const targetTranspilerModule = Transpiler.getTranspilerModuleByPath(path);
    if (!!targetTranspilerModule && targetTranspilerModule.code !== newCode) {
      Transpiler.loadingComponent.show()
      try {
        const now = Date.now();
        await targetTranspilerModule.reset(newCode);
        
        if(File.isStyle(targetTranspilerModule.type) && !targetTranspilerModule.isEntry) {
          await Transpiler.translateAllStyleEntry(targetTranspilerModule.path);
        } else {
          await targetTranspilerModule.translate();
        }
        console.log(`重新编译，耗时${ (Date.now() - now) / 1000}s`)
        // console.log(Transpiler.transpilerModules)
        //如果改动的是样式文件则重现编译所有less文件
        Transpiler.traverseExecute(Transpiler.entryTanspilerModule);
        console.log(Transpiler.transpilerModules)
      } catch(error) {
        console.log(error)
      }
      Transpiler.loadingComponent.close()
    }
  }
  /**
   * 根据触发文件重新编译所有入口样式文件
   */
  public static async translateAllStyleEntry(triggerModulePath: string) {
    let translateStyleEntryPromises = [];
    Transpiler.transpilerModules.forEach((transpilerModule, transpilerModuleName) => {
      if (File.isStyle(transpilerModule.type) && transpilerModule.isEntry && transpilerModule.isIncludeChildren(triggerModulePath)) {
        translateStyleEntryPromises.push(transpilerModule.translate(true));
        console.log(`编译${transpilerModule.path}`)
      }
    })
    await Promise.all(translateStyleEntryPromises);
  }
  public static walk(entryTanspilerModulePath: string, callback: Function) {
    const entryTanspilerModule = Transpiler.getTranspilerModuleByPath(entryTanspilerModulePath);
    if (!!entryTanspilerModule) {
      if(callback(entryTanspilerModule)) {
        return;
      }
      const denpencies = entryTanspilerModule.getDenpencies()
      if(denpencies.length > 0) {
        denpencies.forEach(denpency => {
          Transpiler.walk(denpency, callback);
        })
      }
    } 
  }
  public static getTranspilerModuleByPath(path: string) {
    return Transpiler.transpilerModules.get(path) || null;
  }
  public static setDenpenciesIdMap(parentPath, filePath, transpilerModuleId) {
    Transpiler.denpenciesIdMap.set(`${parentPath}/${filePath}`, transpilerModuleId);
  }
  public static getDenpenciesIdMapValue(parentPath, filePath) {
    let result =  Transpiler.denpenciesIdMap.get(`${parentPath}/${filePath}`) || Transpiler.denpenciesIdMap.get(`${parentPath}${filePath}`) || null;
    return result
  }
  public static getChildrenDenpenciesIdMapValue(parentPath): Map<string, string> {
    let childrenMap = new Map();
    Transpiler.denpenciesIdMap.forEach((value, key) => {
      if (key.indexOf(parentPath) > -1) {
        childrenMap.set(key, value);
      }
    })
    return childrenMap;
  }
  public static traverseExecute(entryTanspilerModule: TranspilerModule) {
    __edith_require__(entryTanspilerModule.path, true);
  }
  public static async setFileMap(filename, code) {
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
    return await Transpiler.packager.loadFile({
      name: data.name,
      version: data.version,
      filePath: data.filePath,
      projectName: Transpiler.projectName
    })
  }
  public static async addNodeModuleDependenies(denpencies: {
    [depName: string]: string
  }){
    await Transpiler.packager.addRootDependency(denpencies);
  }
}
function __edith_require__(modulePath, isForce: boolean = false) {
  if(Transpiler.denpenciesIdMap.get(modulePath)) {
    modulePath = Transpiler.denpenciesIdMap.get(modulePath)
  };
  const transpilter = Transpiler.getTranspilerModuleByPath(modulePath);
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
  } catch (error) {
    module.isLoad = false;
    throw new Error(error)
  }
  return module.exports
}
global.process = {
  env: {
    NODE_ENV: "production"
  }
}