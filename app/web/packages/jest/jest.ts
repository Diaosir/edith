
import Plugin from '@/packages/client-webpack/plugin/plugin'
import Config from './config';
import Module from '@/packages/client-webpack/lib/module'
import * as core from './src/core'
import Console from './src/console'
import * as Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// import * as State  from 'jest-circus/build/state';
const { run, resetState, addEventHandler, ...jestGlobals } = core;

interface IOptions {
  onResult: Function;
}

function addScript(src: string) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.setAttribute('src', src);
    document.body.appendChild(s);
    s.onload = () => {
      resolve();
    };
    s.onerror = error => {
      reject(error);
    };
  });
}
let jsdomPromise = null;
const getJSDOM = () => {
  let jsdomPath = 'https://codesandbox.io/static/js/jsdom-4.0.0.min.js';
  jsdomPromise = jsdomPromise || addScript(jsdomPath);
  return jsdomPromise;
};

export default class Jest extends Plugin {
  public testEntryModules: Map<string, Module> = new Map();
  public options: IOptions;
  public dom: any;
  constructor(options: IOptions) {
    super();
    this.options = options;
    this.manager.globalModules.set('enzyme', Enzyme);
    this.manager.globalModules.set('enzyme-adapter-react-16', Adapter);
    addEventHandler((event, state) => {
      // console.log(event)
    })
  }
  async init() {
    await this.initJSDOM();
    console.log(this.dom)
    await this.reset();
  }
  async traverseTestFile() {
    const reg = /\.(spec|test)\.(ts|js)(x)?$/;
    await Promise.all(Array.from(this.clientWebpack.fileMap.keys()).filter(fileName => reg.test(fileName)).map( async (fileName) => {
      const testFileEntry =  await this.manager.traverse(this.clientWebpack.fileMap.get(fileName), fileName);
      testFileEntry.setGlobals(this.getJestGlobals());
      this.testEntryModules.set(fileName, testFileEntry);
    }));
    this.execute();
  }
  execute() {
    this.testEntryModules.forEach((module, fileName) => {
      this.manager.__edith_require__(fileName);
    }) 
  }
  //TODO 按需编译
  async reset(modulePath?: string){
    resetState();
    try{
      await this.traverseTestFile();
      const result = await run();
      typeof this.options.onResult === 'function' && this.options.onResult(null, result);
    } catch(error) {
      typeof this.options.onResult === 'function' && this.options.onResult(error, null);
    }
  }
  async initJSDOM() {
    await getJSDOM();
    const { JSDOM } = (window as any).JSDOM;
    let url = document.location.origin;
    this.dom = new JSDOM('<!DOCTYPE html>', {
      pretendToBeVisual: true,
      url,
    });
  }
  getJestGlobals(): {
    [key: string]: any
  } {
    const { window: jsdomWindow } = this.dom;
    const { document: jsdomDocument } = jsdomWindow;
    jsdomWindow.Date = Date;
    jsdomWindow.fetch = fetch;

    return {
      ...jestGlobals,
      window: jsdomWindow,
      document: jsdomDocument,
      global: jsdomWindow,
      console: new Console()
    }
  }
}