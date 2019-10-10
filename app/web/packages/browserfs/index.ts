import * as browserfs from 'browserfs';
import { parse } from '@/utils/path'
const fs = require('fs');
import path from 'path'

let isConfigure = false;
export default class BrowserFs {
  public fs: any = browserfs;
  public isConfigure: boolean = false;
  constructor(options?: any) {
  }

  static async configure() {
    browserfs.install(window);
    return new Promise((resolve, reject) => {
      browserfs.configure({
        fs: "LocalStorage"
      }, (e) => {
        if (e) {
          reject(e)
          throw e;
        }
        isConfigure = true;
        resolve();
      })
    })
  }
  static getRealPath(filePath: string): string {
    const filePathParse = parse(filePath);
    const folderJsPath = path.join(filePath, 'index.js');
    if (fs.existsSync(folderJsPath)){
      return folderJsPath
    }
    const jsPath = path.format({
      ...filePathParse,
      ext: '.js',
      base: `${filePathParse.base}.js`
    })
    if (fs.existsSync(jsPath)){
      return jsPath
    }
    return filePath;
    // console.log(ext);
  }
  static async getFileContent(filePath: string): Promise<any> {
    if (!isConfigure) {
      await BrowserFs.configure()
    }
    const realPath = BrowserFs.getRealPath(filePath);
    return new Promise((resolve, reject) => {
      fs.readFile(realPath, function (err, contents) {
        resolve({
          code: contents ? contents.toString() : null,
          fullPath: realPath
        });
      });
    })
  }
  static async checkAndMakeDir(dir: string) {
    const dirArray = dir.split('/');
    dirArray.push('')
    dirArray.reduce((previousValue, currentValue) => {
      if (!fs.existsSync(previousValue) && !!previousValue) {
        fs.mkdirSync(previousValue);
      }
      return previousValue + '/' + currentValue
    })
    // if(!fs.existsSync(dir)) {
    //   console.log(dir)
    // }
  }
  static async setFileContent(filePath: string, content: string) {
    if (!isConfigure) {
      await BrowserFs.configure()
    }
    const { dir } = path.parse(filePath);
    await BrowserFs.checkAndMakeDir(dir);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
      });
    })
  }
}