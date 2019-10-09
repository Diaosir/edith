import {
  IClientWebpackOption
} from './type/index';
import File, { FileType } from '@/datahub/project/entities/file';
import PackageFile from './type/packageFile'
import is from 'is';
import Browserfs from '../browserfs'
import LazyLoad from './lib/lazyload'
import Ast from './lib/ast'
import Packager from './lib/packager';
import Transpiler from './lib/transpiler/transpiler'
import * as path from 'path'

const packaker = new Packager();
const transpiler = new Transpiler(packaker);
export default class ClientWebpack{
  protected fileList: Array<File> = [];
  protected template: string = '';
  protected document: string;
  private entryFile: File | null;
  private packageFile: PackageFile;
  protected packages: Array<string>;
  public name: string = 'test'
  constructor(options: IClientWebpackOption = {}){
    this.fileList  = options.fileList;
    this.template = options.template;
    this.document = options.document;
    if (is.array(this.fileList)) {
      let packageFile = this.fileList.filter(file => file.name === 'package.json')[0];
      if (!!packageFile) {
        this.packageFile = new PackageFile(packageFile);
      }
      this.entryFile = this.getEntryFile();
      // Browserfs.setFileContent('/test/a/a.txt', 'dddd');
      // BrowserFs.getFileContent('/test/a/a.txt').then(data => {
      //   console.log(data)
      // })
      this.packages = this.buildUsedPackages();
      this.init()
      // console.log(Ast.getNpmPackages(this.entryFile.getValue()))
    }
  }
  async init() {
    await packaker.init(this.packageFile.getDependencies());
    this.saveFileToBrowserFs(this.name);
    const a = await transpiler.traverse(this.name, this.entryFile.getValue(), path.join(this.name, this.entryFile.path));
    console.log(a)
  }
  private getEntryFile() {
    const entryFilePath = this.packageFile.getEntryFilePath();
    let entryFile = null;
    File.recursion(this.fileList, (file: File) => {
      if (file.path === entryFilePath) {
        entryFile = file;
      }
    })
    return entryFile;
  }
  private buildUsedPackages(): Array<string> {
    // console.log(this.packageFile)
    let packages: any = {};
    let dependencies = this.packageFile.getDependencies();
    File.recursion(this.fileList, function(file: File) {
      // const value = file.getValue();
      if ([FileType.JS, FileType.JSX, FileType.TS, FileType.TSX].includes(file.type)) {
        const fileDependencies = Ast.getNpmPackages(file.getValue());
        fileDependencies.forEach((dependencie: string)=> {
          packages = {
            ...packages,
            [dependencie]: dependencies[dependencie]
          }
        })
      }
    });
    return packages
  }
  private saveFileToBrowserFs(name) {
    File.recursion(this.fileList, (file: File) => {
      if(file.type !== FileType.FOLDER) {
        Browserfs.setFileContent(path.join(name, file.path), file.getValue());
      }
    })
  }
}