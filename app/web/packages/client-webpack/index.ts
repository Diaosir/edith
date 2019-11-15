import {
  IClientWebpackOption
} from './type/index';
import File, { FileType } from '@/datahub/project/entities/file';
import PackageFile from './type/packageFile'
import * as is from 'is';
import BrowserFs from '../browserfs'
import LazyLoad from './lib/lazyload'
import Ast from './lib/ast'
import Packager from './lib/packager';
import Transpiler from './lib/transpiler/transpiler'
import * as path from 'path'
import { parse, getAllEnablePaths } from '@/utils/path';
import * as Loading from '@/components/Loading';
import Plugin from './plugin/plugin'
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
  public static loadingComponent: any = Loading;
  public static plugins: Array<Plugin> = [];
  public static options: IClientWebpackOption = {
    moduleSuffix: ['js', 'jsx', 'ts', 'tsx', 'vue']
  };
  constructor(options: IClientWebpackOption = {}){
  }
  async init(options: IClientWebpackOption = {}) {
    ClientWebpack.options = {
      ...ClientWebpack.options,
      ...options
    };
    this.template = options.template;
    this.document = options.document;
    this.buildFileMap(options.fileList);
    await this.build();
    //执行插件的init
    ClientWebpack.plugins.forEach((plugin) => {
      typeof plugin.init === 'function' && plugin.init();
    })
  }
  async registerPlugin(plugin: Plugin) {
    console.log(plugin)
    ClientWebpack.plugins.push(plugin);
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
      ClientWebpack.loadingComponent.show();
      await packaker.init(this.packageFile.getDependencies());
      await transpiler.init(this.name, entryFileCode, entryFilePath);
      ClientWebpack.loadingComponent.close();
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
        const filePath = this.formatFilePath(file.path)
        ClientWebpack.fileMap.set(filePath, file.getValue());
        // BrowserFs.setFileContent(filePath,  file.getValue());
      }
    })
  }
  public async changeFile(changeFile: File) {
    const fullPath = this.formatFilePath(changeFile.path);
    ClientWebpack.fileMap.set(fullPath, changeFile.getValue());
    if (changeFile.name === 'package.json') {
      try{
        this.packageFile = new PackageFile({
          value: changeFile.getValue(),
          name: 'package.json'
        });
        packaker.init(this.packageFile.getDependencies());
      } catch(error) {
        console.log(error)
      }
    } else {
      await Transpiler.rebuildTranspilerModule(fullPath, changeFile.getValue());
      ClientWebpack.plugins.forEach((plugin) => {
        typeof plugin.reset === 'function' && plugin.reset(fullPath);
      })
    }

  }
  /**
   * TODO 判断文件为空或者undefined
   * @param filePath 
   */
  public static getFileContentByFilePath(filePath) {
    let allList = getAllEnablePaths(ClientWebpack.options.moduleSuffix, filePath);
    let code = ClientWebpack.fileMap.get(filePath);
   
    if (code === undefined) {
      for(let i = 0; i < allList.length; i++) {
        filePath = allList[i];
        if ((code = ClientWebpack.fileMap.get(filePath)) !== undefined) {
          break;
        }
      }
    }
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