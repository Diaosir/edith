import BaseLoader from '../loader/babel-loader'
import { FileType } from '@/datahub/project/entities/file'
import { URI, UriComponents } from '../lib/Uri'
interface ILoader {
  translate: Function;

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
  public resource?: UriComponents;
  public error: any = null; //是否存在错误
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
  async getLoader(loaderName: string): Promise<ILoader> {
    if (Context._loaders[loaderName]) {
        return Context._loaders[loaderName]
    }
    const loader = await import(
        `../loader/${loaderName}-loader`
    ).then(_ => {
        return _.default
    })
    return Context._loaders[loaderName] = loader;
  }
}