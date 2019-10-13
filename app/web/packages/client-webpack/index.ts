import {
  IClientWebpackOption
} from './type/index';
import File, { FileType } from '@/datahub/project/entities/file';
import PackageFile from './type/packageFile'
import is from 'is';
import BrowserFs from '../browserfs'
import LazyLoad from './lib/lazyload'
import Ast from './lib/ast'
import Packager from './lib/packager';
import Transpiler from './lib/transpiler/transpiler'
import * as path from 'path'

const packaker = new Packager();
const transpiler = new Transpiler(packaker);



export default class ClientWebpack{
  protected template: string = '';
  protected document: string;
  private entryFile: File | null;
  private packageFile: PackageFile;
  protected packages: Array<string>;
  public name: string = 'test'
  public static fileMap: Map<string, string> = new Map();
  constructor(options: IClientWebpackOption = {}){
  }
  async init(options: IClientWebpackOption = {}) {
    this.template = options.template;
    this.document = options.document;
    this.buildFileMap(options.fileList);
    await this.build();
  }
  public async build() {
    let { code: packageJSON } = ClientWebpack.getFileContentByFilePath(this.formatFilePath('package.json'));
    if (!!packageJSON) {
      this.packageFile = new PackageFile({
        value: packageJSON,
        name: 'package.json'
      });
      const { entryFilePath, entryFileCode } = this.getEntryFile();
      // this.packages = this.buildUsedPackages();
      await packaker.init(this.packageFile.getDependencies());
      await transpiler.init(this.name, entryFileCode, entryFilePath);
    }
  }
  private getEntryFile() {
    const entryFilePath = this.packageFile.getEntryFilePath();
    const { code, fullPath } = ClientWebpack.getFileContentByFilePath(this.formatFilePath(entryFilePath));
    return {
      entryFilePath: fullPath,
      entryFileCode: code
    }
  }
  public buildFileMap(fileList: Array<File>) {
    //Todo log
    if(!Array.isArray(fileList)) {
      return;
    }
    File.recursion(fileList, (file: File) => {
      if(file.type !== FileType.FOLDER) {
        ClientWebpack.fileMap.set(this.formatFilePath(file.path), file.getValue())
      }
    })
  }
  // private buildUsedPackages(): Array<string> {
  //   // console.log(this.packageFile)
  //   let packages: any = {};
  //   let dependencies = this.packageFile.getDependencies();
  //   File.recursion(ClientWebpack.fileList, function(file: File) {
  //     // const value = file.getValue();
  //     if ([FileType.JS, FileType.JSX, FileType.TS, FileType.TSX].includes(file.type)) {
  //       const fileDependencies = new Ast(file.getValue()).getNpmPackages();
  //       fileDependencies.forEach((dependencie: string)=> {
  //         packages = {
  //           ...packages,
  //           [dependencie]: dependencies[dependencie]
  //         }
  //       })
  //     }
  //   });
  //   return packages
  // }
  public changeFile(changeFile: File) {
    const fullPath = this.formatFilePath(changeFile.path);
    ClientWebpack.fileMap.set(fullPath, changeFile.getValue());
    Transpiler.rebuildTranspilerModule(fullPath, changeFile.getValue());
  }
  public static getFileContentByFilePath(filePath) {
    let code = ClientWebpack.fileMap.get(filePath) || null;
    return {
      code,
      fullPath: filePath
    }
  }
  /**
   * 格式化文件路径
   * @protected
   * @param {string} filePath
   * @memberof ClientWebpack
   */
  protected formatFilePath(filePath: string) {
    return `/${path.join(this.name, filePath)}`
  }
}