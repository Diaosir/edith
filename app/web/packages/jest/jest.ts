
import Plugin from '@/packages/client-webpack/plugin/plugin'
import Config from './config';
import Module from '@/packages/client-webpack/lib/transpiler/transpiler-module'
import {describe, it, expect, test, run, jest} from 'jest-lite';
import * as Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// console.log(enzyme)
import { toHTML } from './prettify';

const global = window as {[key: string]: any};
global.describe = describe;
global.it = it;
global.expect = expect;
global.test = test;
global.jest = jest;
// global.enzyme = enzyme;
// global.mount = enzyme.mount;

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
    // return this.manager.packager.addRootDependency({
    //   'enzyme': '3.10.0',
    //   'enzyme-adapter-react-16': '1.15.1'
    // }, true);
  }
  async init() {
    await this.addDependencies()
    await this.traverseTestFile();
    const result = await this.run();
    typeof this.options.onResult === 'function' && this.options.onResult(result);
  }
  async traverseTestFile() {
    const reg = /\.(spec|test)\.(ts|js)(x)?$/;
    await Promise.all(Array.from(this.clientWebpack.fileMap.keys()).filter(fileName => reg.test(fileName)).map( async (fileName) => {
      const testFileEntry =  await this.manager.traverse(this.clientWebpack.fileMap.get(fileName), fileName);
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