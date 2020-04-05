import {
  IClientWebpackOption
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
import api from 'edith-utils/lib/api';
const packaker = new Packager();
const transpiler = new Manager(packaker);

const fileSystem = new Memfs(); //文件系统
// const nodeModulesFileSystem = new LocalStorageFileSystem('node_modules'); //node_modules
const globalModulesFileSystem = new Memfs(); //全局变量


const global = window as { [key: string] : any}
global.fileSystem = fileSystem;
export default class ClientWebpack{
  protected template: string = '';
  protected document: string;
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
    Manager.fileService.registerProvider('localFs', fileSystem);
    Manager.fileService.registerProvider('global', globalModulesFileSystem);
  }
  async init(options: IClientWebpackOption = {}) {
    ClientWebpack.options = {
      ...ClientWebpack.options,
      ...options
    };
    this.template = options.template;
    this.document = options.document;
    await this.createFiles(options.fileList);
    this.buildFileMap(options.fileList);
    await this.build();
    //执行插件的init
    ClientWebpack.plugins.forEach((plugin) => {
      typeof plugin.init === 'function' && plugin.init();
    })
  }
  async registerPlugin(plugin: Plugin) {
    ClientWebpack.plugins.push(plugin);
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
    let { code: packageJSON } = ClientWebpack.getFileContentByFilePath(this.formatFilePath('package.json'));
    if (!!packageJSON) {
      this.packageFile = new PackageFile({
        value: packageJSON,
        name: 'package.json'
      });
      await this.combinationsDependencies(this.packageFile.getDependencies())
      // let filename = await Manager.fileService.resolve(URI.parse(`localFs:./index.scss`), URI.parse(`localFs:/test/src/index.jsx`), `/test/node_modules`);
      // console.log(filename)
      const { entryFilePath, entryFileCode } = this.getEntryFile();
      // this.packages = this.buildUsedPackages();
      ClientWebpack.loadingComponent.show();
      // await packaker.init(this.packageFile.getDependencies());
      // console.log(entryFileCode)
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
        // BrowserFs.setFileContent(filePath,  file.getValue())
        Manager.fileService.writeFile(URI.parse(`localFs:${filePath}`), file.getValue());
      }
    })
  }
  public async changeFile(changeFile: File) {
    const fullPath = this.formatFilePath(changeFile.path);
    // ClientWebpack.fileMap.set(fullPath, changeFile.getValue());
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
      ClientWebpack.plugins.forEach((plugin) => {
        typeof plugin.reset === 'function' && plugin.reset();
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
  public async combinationsDependencies(dependencies) {
    const { contents, dependencyDependencies } = await api.v2.packages.combinations(dependencies).then((res) => {
      if (res.code == 200) {
        return res.payload
      }
      return null
    })
    const deps = new Map();
    Object.keys(dependencyDependencies).forEach(key => deps.set(key, {
      name: key,
      ...dependencyDependencies[key]
    }))
    packaker.dependencyDependencies = deps;
    packaker.contents = contents;
    // throw new Error('111')
    await Promise.all(Object.keys(contents).map( async contentName => {
      await fileSystem.writeFileAnyway(URI.parse(`localFs:test/${contentName}`), contents[contentName].content, { create: true, overwrite: true });
    }))
  }
}