import File, { FileType } from '@/datahub/project/entities/file';
import TranspilerModule from './transpiler-module'
import Packager from '../packager'
import BrowserFs from '@/packages/browserfs';
import * as path from 'path';
import ClientWebpack from '@/packages/client-webpack';

const global = window as { [key:string]: any};
function resolve(from: string, to: string) {
  //Todo 判断是否为文件或者文件夹
  const { ext } = path.parse(from);
  return path.resolve(!!ext ? path.resolve(from, '..') : from, to)
}
function isNodeModules(filePath: string) {
  return filePath.indexOf('./') === -1 || filePath.match(/node_modules/);
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
  public packager: Packager;
  public static entryTanspilerModule: TranspilerModule;
  constructor(packaker: Packager) {
    this.packager = packaker;
  }
  public async init(projectName: string, code: string, filePath: string) {
    Transpiler.entryTanspilerModule = await this.traverse(projectName, code, filePath);
    await Transpiler.traverseTranslate(Transpiler.entryTanspilerModule.path);
    console.log(Transpiler.transpilerModules)
    Transpiler.traverseExecute(Transpiler.entryTanspilerModule);
  }
  /**
   * 递归编译入口文件找到所有依赖文件
   * @param entryFile
   */
  public async traverse(projectName: string, code: string, filePath: string) {
    let basePath = filePath;
    const transpiler = Transpiler.transpilerModules.get(basePath) || new TranspilerModule({code, path: basePath});
    Transpiler.transpilerModules.set(transpiler.path, transpiler);
    if (!transpiler.isTraverse) {
      for(let i = 0; i < transpiler.allPackages.length; i++) {
        let value = transpiler.allPackages[i];
        if(isNodeModules(value)) {
          const filePath =  path.join(projectName, 'node_modules', value);
          const { code, fullPath } = await this.packager.getPackageFileOnlyPath(filePath);
          const childrenTranspiler = await this.traverse(projectName, code, fullPath);
          transpiler.denpencies.push(childrenTranspiler.path);
          Transpiler.setDenpenciesIdMap(basePath, value, childrenTranspiler.path);
        } else {
          const filePath = resolve(basePath, value);
          if (filePath.match(/node_modules/)) {
            const { code, fullPath }  = await this.packager.getPackageFileOnlyPath(filePath);
            const { path } = await this.traverse(projectName, code, fullPath);
            transpiler.denpencies.push(path);
            Transpiler.setDenpenciesIdMap(basePath, value, path);
          } else {
            // const {code, fullPath } = await BrowserFs.getFileContent(filePath);
            const { code , fullPath } = await ClientWebpack.getFileContentByFilePath(filePath);
            const { path } = await this.traverse(projectName, code, fullPath);
            transpiler.denpencies.push(path);
            Transpiler.setDenpenciesIdMap(basePath, value, path);
          }
        }
      }
    }
    transpiler.isTraverse = true;
    return transpiler;
  }
  /**
   * 修改模块代码
   */
  public static async rebuildTranspilerModule(path: string, newCode: string) {
    const targetTranspilerModule = Transpiler.getTranspilerModuleByPath(path);
    if (!!targetTranspilerModule) {
      await targetTranspilerModule.reset(newCode);
      //如果改动的是样式文件则重现编译所有less文件
      if (File.filenameToFileType(path) === FileType.LESS) {
        await Transpiler.traverseTranslate(Transpiler.entryTanspilerModule.path, /.less$/);
      }
      __edith_require__(path, true);
      Transpiler.traverseExecute(Transpiler.entryTanspilerModule);
    }
  }
  public static getTranspilerModuleByPath(path: string) {
    return Transpiler.transpilerModules.get(path) || null;
  }
  public static setDenpenciesIdMap(parentPath, filePath, transpilerModuleId) {
    Transpiler.denpenciesIdMap.set(`${parentPath}/${filePath}`, transpilerModuleId);
  }
  public static getDenpenciesIdMapValue(parentPath, filePath) {
    return Transpiler.denpenciesIdMap.get(`${parentPath}/${filePath}`) || null;
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
    if (targetTranspilerModule.denpencies.length > 0) {
      for(let i = 0; i < targetTranspilerModule.denpencies.length; i++) {
        await Transpiler.traverseTranslate(targetTranspilerModule.denpencies[i], includes)
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