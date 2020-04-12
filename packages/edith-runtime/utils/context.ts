import { FileType } from 'edith-types/lib/file'
import { URI } from 'edith-types/lib/uri'
interface ILoader {
  translate: Function;
}
function parseUrl(url: string) {
  const [newUrl, queryString]= url.split("#")[0].split('?');
  return {
    path: newUrl,
    query: queryString ? queryString.split('&').reduce((pre, cur, index) => {
      const search = cur.split('=');
      return {
        ...pre,
        [search[0]]: search[1]
      }
    }, {}) : {}
  }
}
export default class Context {
  public code: string;
  public isEntry: boolean;
  public manager: any;
  public config: any;
  public path: string;
  public type: FileType;
  public files: Array<any>;
  public transpilingCode: string;
  public denpencies: Array<string>;
  public resource?: URI;
  public node_modules_path: string = '';
  public error: any = null; //是否存在错误
  public options: {
    [key: string]: any;
  }
  private static _loaders: {
    [propName: string]: any;
  } = {};
  /**
   *Creates an instance of Context.
   * @param {*} app 
   * @memberof Context
   */
  constructor(app?: any) {
    // this.app = app;
    // this.config = app.config;
    this.manager = app
  }
  async getLoader(loaderName: string): Promise<{
    loader: ILoader,
    options: {
      [key: string]: any;
    }
  }> {
    const parseResult = parseUrl(loaderName)
    if (!Context._loaders[parseResult.path]) {
      const loader = await import(
          `../loader/${parseResult.path}`
      ).then(_ => {
          return _.default
      })
      Context._loaders[parseResult.path] = loader;
    }
    return {
      loader: Context._loaders[parseResult.path],
      options: parseResult.query
    };
  }
  async timeline(func, after) {
    const now = Date.now();
    await func();
    await after(Date.now() - now);
  }
}