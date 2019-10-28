import File, { FileType } from '@/datahub/project/entities/file';
import TranspilerModule from './transpiler-module'
import Packager from '../packager'
import BrowserFs from '@/packages/browserfs';
import * as path from 'path';
import ClientWebpack from '@/packages/client-webpack';
import { normalize, isNodeModules } from '@/utils/path';
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
    console.log(Transpiler.denpenciesIdMap)
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
    const parentTranspilerTpye = File.filenameToFileType(parentTranspilerPath);

    if (transpiler.path) {
      Transpiler.transpilerModules.set(transpiler.path, transpiler);

      if (parentTranspilerPath) {
        transpiler.addParent(parentTranspilerPath);
      }
      if (![FileType.LESS].includes(parentTranspilerTpye) && [FileType.CSS, FileType.LESS].includes(transpiler.type)) {
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
    console.log(localFileInfo)
    let childrenTranspiler= null, code = '';
    // TODO 判断获取node_modules还是本地文件
    if(!!localFileInfo.code) {
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
  /**
   * 遍历翻译所有的模块
   * @static
   * @memberof Transpiler
   */
  public static async traverseTranslate(modulePath: string, includes: RegExp = null) {
    const targetTranspilerModule = Transpiler.getTranspilerModuleByPath(modulePath);
    if (!targetTranspilerModule) {
      return;
    }
    
    let allPromisesMap = new Map();
    function getTranslatePromise(modulePath: string) {
      const transpilerModule = Transpiler.getTranspilerModuleByPath(modulePath);
      if (!includes || includes.exec(modulePath)) {
        const denpencies = transpilerModule.getDenpencies();  
        if(transpilerModule.type !== FileType.LESS) {
          denpencies.forEach((denpency) => {
            getTranslatePromise(denpency);
          })
        }
        if(!allPromisesMap.get(modulePath)) {
          allPromisesMap.set(modulePath, transpilerModule.translate(true));
        }
      }
    }
    getTranslatePromise(modulePath);
    await Promise.all(Array.from(allPromisesMap.values()));
  }
  public static async setFileMap(filename, code) {
    ClientWebpack.fileMap.set(filename, code);
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
      isLoad: false,
      exports: {}
  }
  transpilter.getModuleFunction().call(module.exports, module, module.exports, __edith_require__);
  module.isLoad = true;
  transpilter.module = module;
  return module.exports
}
global.process = {
  env: {
    NODE_ENV: "production"
  }
}