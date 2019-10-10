import File, { FileType } from '@/datahub/project/entities/file';
import Ast from '../ast'
import TranspiledModule from './transpiler-module'
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
  public TranspiledModules: Array<TranspiledModule> = [];
  public packager: Packager;
  constructor(packaker: Packager) {
    this.packager = packaker;
  }
  public async init(entryFile: File) {

  }
  /**
   * 递归编译入口文件
   * @param entryFile
   */
  public async traverse(projectName: string, code: string, filePath: string) {
    let basePath = filePath;
    const dependencies = await Ast.getAllPackages(code);
    const transpiler = new TranspiledModule({code, path: basePath});
    dependencies.forEach(async (value: string) => {
      if(isNodeModules(value)) {
        const filePath =  path.join(projectName, 'node_modules', value);
        const { code, fullPath } = await this.packager.getPackageFileOnlyPath(filePath);
        const childrenTranspiler = await this.traverse(projectName, code, fullPath)
        transpiler.denpencies.push(childrenTranspiler)
      } else {
        const filePath = resolve(basePath, value);
        if (filePath.match(/node_modules/)) {
          const { code, fullPath }  = await this.packager.getPackageFileOnlyPath(filePath);
          transpiler.denpencies.push(await this.traverse(projectName, code, fullPath))
        } else {
          const {code, fullPath } = await BrowserFs.getFileContent(filePath);
          transpiler.denpencies.push(await this.traverse(projectName, code, fullPath))
        }
        
      }
    })
    return transpiler;
  }
}