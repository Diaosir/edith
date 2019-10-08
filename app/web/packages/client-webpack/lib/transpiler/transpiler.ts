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
  return filePath.indexOf('./') === -1
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
    // console.log(path.resolve(`/${entryFile.path}`, './styles.css'));
    let basePath = filePath;
    const dependencies = await Ast.getAllPackages(code);
    const transpiler = new TranspiledModule({code, path: basePath});
    dependencies.forEach(async (value: string) => {
      if(isNodeModules(value)) {
        const filePath = path.join(projectName, 'node_modules', value);
        const code = await this.packager.getPackageFileOnlyPath(filePath)
        const childrenTranspiler = await this.traverse(projectName, code, filePath)
        transpiler.denpencies.push(childrenTranspiler)
      } else {
        const filePath = resolve(basePath, value)
        const code = await BrowserFs.getFileContent(filePath)
        transpiler.denpencies.push(await this.traverse(projectName, code, filePath))
      }
    })
    return transpiler;
  }
}