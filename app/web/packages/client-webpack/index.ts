import {
  IClientWebpackOption
} from './type/index';
import File from '@/datahub/project/entities/file';
import PackageFile from './type/packageFile'
import is from 'is';
import Browserfs from '../browserfs'
import LazyLoad from './lib/lazyload'
new LazyLoad('react', '')
export default class ClientWebpack{
  protected fileList: Array<File> = [];
  protected template: string = '';
  protected document: string;
  private entryFile: File | null;
  private packageFile: PackageFile;
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
    }
    Browserfs.setFileContent('/test/a.txt', 'dddd');
  }
  private getEntryFile() {
    const entryFilePath = this.packageFile.getEntryFilePath();
    if (!!entryFilePath) {
      console.log(entryFilePath)
    }
    let entryFile = null;
    File.recursion(this.fileList, (file: File) => {
      if (file.path === entryFilePath) {
        entryFile = file;
      }
    })
    console.log(entryFile)
    return entryFile;
  }
}