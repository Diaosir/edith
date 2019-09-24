import * as browserfs from 'browserfs';
export default class BrowserFs {
  public fs: any = browserfs;
  constructor(options?: any) {
    browserfs.install(window);
    this.fs.configure({
      fs: "LocalStorage"
    }, function(e) {
      console.log(e)
      console.log(browserfs)
      if (e) {
        // An error happened!
        throw e;
      }
      // Otherwise, BrowserFS is ready-to-use!
    });
    // console.log(browserfs.getFileSystem())
  }
}