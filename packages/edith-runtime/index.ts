import {
  IEdithRuntimeOption
} from './type/index';
import File, { FileType } from 'edith-types/lib/file';
import PackageFile from './type/packageFile'
import Packager from './lib/packager';
import Manager from './lib/manager'
import * as path from 'path'
import { getAllEnablePaths } from 'edith-utils/lib/path';
import * as Loading from '@/components/Loading';
import Plugin from './plugin/plugin'
import Memfs from 'edith-types/lib/file/memfs';
import { URI } from 'edith-types/lib/uri'
const fileSystem = new Memfs(); //文件系统
const packaker = new Packager();
const transpiler = new Manager(packaker);

// const nodeModulesFileSystem = new LocalStorageFileSystem('node_modules'); //node_modules
const globalModulesFileSystem = new Memfs(); //全局变量
const global = window as { [key: string] : any}
global.fileSystem = fileSystem;
// indexedDBFs.writeFileAnyway(URI.parse('unpkg:/huangzhen/test.js'), 'asfdsafdf').then(async () => {
// })
// global.indexedDBFs = indexedDBFs;
export default class EdithRuntime{
  protected template: string = '';
  protected document: string;
  private packageFile: PackageFile;
  protected packages: Array<string>;
  public name: string = 'test'
  public static fileMap: Map<string, string> = new Map();
  public static loadingComponent: any = Loading;
  public static plugins: Array<Plugin> = [];
  public static options: IEdithRuntimeOption = {
    moduleSuffix: ['js', 'jsx', 'ts', 'tsx', 'vue']
  };
  constructor(options: IEdithRuntimeOption = {}){
    Manager.fileService.registerProvider('localFs', fileSystem);
    Manager.fileService.registerProvider('global', globalModulesFileSystem);
  }
  async init(options: IEdithRuntimeOption = {}) {
    EdithRuntime.options = {
      ...EdithRuntime.options,
      ...options
    };
    this.template = options.template;
    this.document = options.document;
    await this.createFiles(options.fileList);
    this.buildFileMap(options.fileList);
    await this.build();
    //执行插件的init
    EdithRuntime.plugins.forEach((plugin) => {
      typeof plugin.init === 'function' && plugin.init();
    })
  }
  async registerPlugin(plugin: Plugin) {
    EdithRuntime.plugins.push(plugin);
  }
  async createFiles(fileList: Array<File>) {
    const scheme = 'localFs';
    const root = `/${this.name}`
    await fileSystem.mkdir(URI.parse(`${scheme}:${root}`));
    const createFile = async (fileList: Array<File> = []) => {
      if(fileList.length > 0) {
        await Promise.all(fileList.map( async (file) => {
          if (file.type === FileType.FOLDER) {
            await fileSystem.mkdir(URI.parse(`${scheme}:${root}/${file.path}/`));
          } else {
            await fileSystem.writeFile(URI.parse(`${scheme}:${root}/${file.path}`), file.getValue(), { create: true, overwrite: true });
          }
          if (file.children.length > 0) {
            await createFile(file.children);
          }
        }))
      }
    }
    await createFile(fileList)

  }
  public async build() {
    let { code: packageJSON } = EdithRuntime.getFileContentByFilePath(this.formatFilePath('package.json'));
    if (!!packageJSON) {
      this.packageFile = new PackageFile({
        value: packageJSON,
        name: 'package.json'
      });
      // await this.combinationsDependencies(this.packageFile.getDependencies())
      // let filename = await Manager.fileService.resolve(URI.parse(`localFs:./index.scss`), URI.parse(`localFs:/test/src/index.jsx`), `/test/node_modules`);
      // console.log(filename)
      const { entryFilePath, entryFileCode } = this.getEntryFile();
      // this.packages = this.buildUsedPackages();
      EdithRuntime.loadingComponent.show();
      await packaker.init(this.packageFile.getDependencies());
      // console.log(entryFileCode)
      await transpiler.init(this.name, entryFileCode, entryFilePath);
      EdithRuntime.loadingComponent.close();
    }
  }
  private getEntryFile() {
    const entryFilePath = this.packageFile.getEntryFilePath();
    const { code, fullPath } = EdithRuntime.getFileContentByFilePath(this.formatFilePath(entryFilePath));
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
        EdithRuntime.fileMap.set(filePath, file.getValue());
        // BrowserFs.setFileContent(filePath,  file.getValue())
        Manager.fileService.writeFile(URI.parse(`localFs:${filePath}`), file.getValue());
      }
    })
  }
  public async changeFile(changeFile: File) {
    const fullPath = this.formatFilePath(changeFile.path);
    // EdithRuntime.fileMap.set(fullPath, changeFile.getValue());
    await fileSystem.writeFileAnyway(URI.parse(`localFs:${fullPath}`), changeFile.getValue());

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
      await Manager.rebuildTranspilerModule(fullPath);
      EdithRuntime.plugins.forEach((plugin) => {
        typeof plugin.reset === 'function' && plugin.reset();
      })
    }

  }
  /**
   * TODO 判断文件为空或者undefined
   * @param filePath 
   */
  public static getFileContentByFilePath(filePath) {
    let allList = getAllEnablePaths(EdithRuntime.options.moduleSuffix, filePath);
    let code = EdithRuntime.fileMap.get(filePath);
   
    if (code === undefined) {
      for(let i = 0; i < allList.length; i++) {
        filePath = allList[i];
        if ((code = EdithRuntime.fileMap.get(filePath)) !== undefined) {
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
   * @memberof EdithRuntime
   */
  protected formatFilePath(filePath: string) {
    return `/${path.join(this.name, filePath)}`
  }
}