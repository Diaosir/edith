import File, { FileType } from '@/datahub/project/entities/file';
import TranspilerModule from './transpiler-module'
import Packager from '../packager'
import BrowserFs from '@/packages/browserfs';
import * as path from 'path';
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
  public transpilerModules: Map<string, TranspilerModule> = new Map();
  public packager: Packager;
  public entryTanspilerModule: TranspilerModule;
  constructor(packaker: Packager) {
    this.packager = packaker;
  }
  public async init(projectName: string, code: string, filePath: string) {
    this.entryTanspilerModule = await this.traverse(projectName, code, filePath);
    // this.entryTanspilerModule.moduleEval();
    console.log(this.entryTanspilerModule)
    console.log(this.transpilerModules)
  }
  /**
   * 递归编译入口文件
   * @param entryFile
   */
  public async traverse(projectName: string, code: string, filePath: string) {
    let basePath = filePath;
    const transpiler = this.transpilerModules.get(TranspilerModule.getIdByPath(basePath)) || new TranspilerModule({code, path: basePath});
    this.transpilerModules.set(transpiler.id, transpiler);
    if (!transpiler.isTraverse) {
      transpiler.ast.allPackages.forEach(async (value: string) => {
        if(isNodeModules(value)) {
          const filePath =  path.join(projectName, 'node_modules', value);
          const { code, fullPath } = await this.packager.getPackageFileOnlyPath(filePath);
          const childrenTranspiler = await this.traverse(projectName, code, fullPath)
          transpiler.denpencies.push(childrenTranspiler.id);
        } else {
          const filePath = resolve(basePath, value);
          if (filePath.match(/node_modules/)) {
            const { code, fullPath }  = await this.packager.getPackageFileOnlyPath(filePath);
            const { id } = await this.traverse(projectName, code, fullPath);
            transpiler.denpencies.push(id)
          } else {
            const {code, fullPath } = await BrowserFs.getFileContent(filePath);
            const { id } = await this.traverse(projectName, code, fullPath);
            transpiler.denpencies.push(id);
          }
        }
      })
    }
    transpiler.isTraverse = true;
    return transpiler;
  }

}