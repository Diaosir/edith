
import Plugin from '@/packages/client-webpack/plugin/plugin'
import Config from './config';
import Module from '@/packages/client-webpack/lib/transpiler/transpiler-module'
import * as core from 'jest-lite'
import * as Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { toHTML } from './prettify';

const { run, ...jestGlobals } = core;

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
  public static toHTML(result) {
    return toHTML(result)
  }
  async addDependencies(){
  }
  async init() {
    await this.traverseTestFile();
    const result = await this.run();
    typeof this.options.onResult === 'function' && this.options.onResult(result);
  }
  async traverseTestFile() {
    const reg = /\.(spec|test)\.(ts|js)(x)?$/;
    await Promise.all(Array.from(this.clientWebpack.fileMap.keys()).filter(fileName => reg.test(fileName)).map( async (fileName) => {
      const testFileEntry =  await this.manager.traverse(this.clientWebpack.fileMap.get(fileName), fileName);
      testFileEntry.setGlobals(jestGlobals);
      this.entryModules.set(fileName, testFileEntry);
    }));
    console.log(this.entryModules)
    this.excute();
    // this.clientWebpack.fileMap.forEach((fileCode, fileName) => {
    //   if (reg.test(fileName)) {
    //     this.manager.traverse(fileCode, fileName);
    //   }
    // })
  }
  excute() {
    this.entryModules.forEach((module, fileName) => {
      this.manager.__edith_require__(fileName);
    }) 
  }
  fileChange() {

  }
  async reset(){
    await this.traverseTestFile();
    const result = await this.run();
    typeof this.options.onResult === 'function' && this.options.onResult(result);
  }
  async run() {
    return run();
  }
}