import BaseLoader from '../loader/babel-loader'
export default class Context {
  public loader: {
    [propName: string]: any;
  };
  /**
   *Creates an instance of Context.
   * @param {*} app 
   * @memberof Context
   */
  constructor() {
    // this.app = app;
    // this.config = app.config;
    this.loader = new Proxy({}, {
        get: async function(target: {[key: string]: any}, name: string) {
            if (target[name]) {
                return target[name]
            }
            const loader = await import(
                `../loader/${name}-loader`
            ).then(_ => {
                return _.default
            })
            return target[name] = loader;
        }
    })
  }
}