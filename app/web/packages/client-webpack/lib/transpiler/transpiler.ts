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
    await Transpiler.traverseTranslate(Transpiler.entryTanspilerModule.path);
    console.log('编译花了: ' + (Date.now() - now) / 1000 + 's');
    now = Date.now()
    Transpiler.traverseExecute(Transpiler.entryTanspilerModule);
    console.log('执行代码花了: ' + (Date.now() - now) / 1000 + 's');
  
  }
  /**
   * 递归编译入口文件找到所有依赖文件
   * @param entryFile
   */
  public static async traverse(code: string, filePath: string) {
    const transpiler = Transpiler.transpilerModules.get(normalize(filePath)) || new TranspilerModule({code, path: normalize(filePath)});
    if (transpiler.path) {
      Transpiler.transpilerModules.set(transpiler.path, transpiler);
    }
    if (!transpiler.isTraverse) {
      transpiler.isTraverse = true;
      await Promise.all(transpiler.allPackages.map( async (packageName) => {
        return Transpiler.traverseChildren(transpiler, packageName);
      }))
      // for(let i = 0; i < transpiler.allPackages.length; i++) {
      //   await Transpiler.traverseChildren(transpiler, transpiler.allPackages[i]);
      // }
    }
    return transpiler;
  }
  public static async traverseChildren(parentTranspiler: TranspilerModule, moduleName: string) {
    const basePath = parentTranspiler.path;
    let filename = resolve(basePath, moduleName);
    const localFileInfo = await ClientWebpack.getFileContentByFilePath(filename);
    let childrenTranspiler= null;
    // TODO 判断获取node_modules还是本地文件
    if(!!localFileInfo.code) {
      childrenTranspiler = await Transpiler.traverse(localFileInfo.code, localFileInfo.fullPath);
    } else {
      //排除node_modules中样式文件的引用路径，例如：@import 'a.less';
      if (isNodeModules(moduleName) && ![FileType.LESS, FileType.SCSS, FileType.CSS].includes(parentTranspiler.type)) {
        filename = path.join('/', Transpiler.projectName, 'node_modules', moduleName);
      }
      const { code, fullPath } = await Transpiler.packager.getPackageFileOnlyPath(filename);
      childrenTranspiler = await Transpiler.traverse(code, fullPath);
    }
    if (childrenTranspiler && childrenTranspiler.path) {
      parentTranspiler.addDenpency(childrenTranspiler.path);
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
        const newPackages = await targetTranspilerModule.getNewPackages(newCode);
        for( let i = 0; i < newPackages.length; i++) {
          await Promise.all(newPackages.map(async(packageName) => {
            return Transpiler.traverseChildren(targetTranspilerModule, packageName);
          }))
        }
        await targetTranspilerModule.reset(newCode);
        const now = Date.now()
        // 如果新增依赖包，则循环编译
        if (newPackages.length > 0) {
          await Transpiler.traverseTranslate(targetTranspilerModule.path);
        } else {
          await targetTranspilerModule.translate();
        }
        console.log(`重新编译${targetTranspilerModule.path}，耗时${ (Date.now() - now) / 1000}s`)
        // console.log(Transpiler.transpilerModules)
        //如果改动的是样式文件则重现编译所有less文件
        if (File.filenameToFileType(path) === FileType.LESS) {
          await Transpiler.traverseTranslate(Transpiler.entryTanspilerModule.path, /.less$/);
        }
        __edith_require__(path, true);
        Transpiler.traverseExecute(Transpiler.entryTanspilerModule);
      } catch(error) {
        console.log(error)
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
    // const targetTranspilerModule = Transpiler.getTranspilerModuleByPath(modulePath);
    // if (!targetTranspilerModule) {
    //   return;
    // }
    // const denpencies = targetTranspilerModule.getDenpencies();
    // if (denpencies.length > 0) {
    //   if (targetTranspilerModule.type !== FileType.LESS) {
    //     await Promise.all(denpencies.map(denpency => {
    //       return Transpiler.traverseTranslate(denpency, includes)
    //     }))
    //   }
    // }
    // if (!includes || includes.exec(modulePath)) {
    //   await targetTranspilerModule.translate();
    // }


    const targetTranspilerModule = Transpiler.getTranspilerModuleByPath(modulePath);
    if (!targetTranspilerModule) {
      return;
    }
    const denpencies = targetTranspilerModule.getDenpencies();
    if (denpencies.length > 0) {
      if (targetTranspilerModule.type !== FileType.LESS) {
        for(let i = 0; i < denpencies.length; i++) {
          await Transpiler.traverseTranslate(denpencies[i], includes)
        }
      }
    }
    if (!includes || includes.exec(modulePath)) {
      await targetTranspilerModule.translate();
    }
  }
}
function __edith_require__(modulePath, isForce: boolean = false) {
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