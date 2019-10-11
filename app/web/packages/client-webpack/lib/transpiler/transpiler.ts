import File, { FileType } from '@/datahub/project/entities/file';
import TranspilerModule from './transpiler-module'
import Packager from '../packager'
import BrowserFs from '@/packages/browserfs';
import * as path from 'path';
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
  public entryTanspilerModule: TranspilerModule;
  constructor(packaker: Packager) {
    this.packager = packaker;
  }
  public async init(projectName: string, code: string, filePath: string) {
    this.entryTanspilerModule = await this.traverse(projectName, code, filePath);
    console.log(Transpiler.transpilerModules)
    this.traverseModuleEval(this.entryTanspilerModule);
  }
  /**
   * 递归编译入口文件
   * @param entryFile
   */
  public async traverse(projectName: string, code: string, filePath: string) {
    let basePath = filePath;
    const transpiler = Transpiler.transpilerModules.get(TranspilerModule.getIdByPath(basePath)) || new TranspilerModule({code, path: basePath});
    Transpiler.transpilerModules.set(transpiler.id, transpiler);
    if (!transpiler.isTraverse) {
      const allPackages = Array.from(transpiler.ast.allPackages);
      for(let i = 0; i < allPackages.length; i++) {
        let value = allPackages[i];
        if(isNodeModules(value)) {
          const filePath =  path.join(projectName, 'node_modules', value);
          const { code, fullPath } = await this.packager.getPackageFileOnlyPath(filePath);
          const childrenTranspiler = await this.traverse(projectName, code, fullPath);
          transpiler.denpencies.push(childrenTranspiler.id);
          Transpiler.setDenpenciesIdMap(basePath, value, childrenTranspiler.id);
        } else {
          const filePath = resolve(basePath, value);
          if (filePath.match(/node_modules/)) {
            const { code, fullPath }  = await this.packager.getPackageFileOnlyPath(filePath);
            const { id } = await this.traverse(projectName, code, fullPath);
            transpiler.denpencies.push(id);
            Transpiler.setDenpenciesIdMap(basePath, value, id);
          } else {
            const {code, fullPath } = await BrowserFs.getFileContent(filePath);
            const { id } = await this.traverse(projectName, code, fullPath);
            transpiler.denpencies.push(id);
            Transpiler.setDenpenciesIdMap(basePath, value, id);
          }
        }
      }
    }
    transpiler.isTraverse = true;
    return transpiler;
  }
  public static getTranspilerModuleById(id: string) {
    return Transpiler.transpilerModules.get(id) || null;
  }
  public static setDenpenciesIdMap(parentPath, filePath, transpilerModuleId) {
    Transpiler.denpenciesIdMap.set(`${parentPath}/${filePath}`, transpilerModuleId);
  }
  public static getDenpenciesIdMapValue(parentPath, filePath) {
    return Transpiler.denpenciesIdMap.get(`${parentPath}/${filePath}`) || null;
  }
  public traverseModuleEval(entryTanspilerModule: TranspilerModule) {
    __edith_require__(this.entryTanspilerModule.id);
  }
}
function __edith_require__(moduleId) {
  const transpilter = Transpiler.getTranspilerModuleById(moduleId);
  if (transpilter.isLoad) {
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