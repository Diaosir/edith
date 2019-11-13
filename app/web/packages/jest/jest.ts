
import Plugin from '@/packages/client-webpack/plugin/plugin'
import Config from './config';
import Module from '@/packages/client-webpack/lib/transpiler/transpiler-module'
import * as core from './src/core'
import * as Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import * as State  from 'jest-circus/build/state';
const { run, resetState,  ...jestGlobals } = core;

interface IOptions {
  onResult: Function;
  containerDom?: HTMLElement;
}
export default class Jest extends Plugin {
  public entryModules: Map<string, Module> = new Map();
  public options: IOptions;
  constructor(options: IOptions) {
    super();
    this.options = options;
    this.manager.globalModules.set('enzyme', Enzyme);
    this.manager.globalModules.set('enzyme-adapter-react-16', Adapter);
  }
  async addDependencies(){
  }
  async init() {
    await this.reset();
  }
  async traverseTestFile() {
    const reg = /\.(spec|test)\.(ts|js)(x)?$/;
    await Promise.all(Array.from(this.clientWebpack.fileMap.keys()).filter(fileName => reg.test(fileName)).map( async (fileName) => {
      const testFileEntry =  await this.manager.traverse(this.clientWebpack.fileMap.get(fileName), fileName);
      testFileEntry.setGlobals(jestGlobals);
      this.entryModules.set(fileName, testFileEntry);
    }));
    this.execute();
  }
  execute() {
    this.entryModules.forEach((module, fileName) => {
      this.manager.__edith_require__(fileName);
    }) 
  }
  fileChange() {

  }
  //TODO 按需编译
  async reset(){
    resetState();
    try{
      await this.traverseTestFile();
      const result = await this.run();
      typeof this.options.onResult === 'function' && this.options.onResult(null, result);
    } catch(error) {
      typeof this.options.onResult === 'function' && this.options.onResult(error, null);
    }
  }
  async run() {
    return run();
  }
}