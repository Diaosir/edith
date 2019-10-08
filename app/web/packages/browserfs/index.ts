import * as browserfs from 'browserfs';
const fs = require('fs');
const path = require('path')
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
  static async getFileContent(filePath: string) {
    if (!isConfigure) {
      await BrowserFs.configure()
    }
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, function (err, contents) {
        resolve(contents ? contents.toString() : null);
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