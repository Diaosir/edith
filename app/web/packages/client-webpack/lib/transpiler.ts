import File, { FileType } from '@/datahub/project/entities/file';
import Ast from './lib/ast'
/**
 * 编译阶段
 */
export default class Transpiler {
  constructor() {
  }
  public async init(entryFile: File) {

  }
  /**
   * 递归编译入口文件
   * @param entryFile
   */
  public traverse(entryFile: File) {
    const value = entryFile.getValue();
    console.log(value)
  }
}