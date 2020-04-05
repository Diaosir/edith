import BaseLoader from '../base-loader'
import Worker from 'worker-loader!./translate.worker.js';
import { FileType } from 'edith-types/lib/file'
import { setStylesheet, deleteStylesheet} from '../../utils'
import getSassDependencies  from "./get-sass-dependencies";
import Context from '../../utils/context'
import { boundClass } from 'autobind-decorator'
@boundClass
export  class SassLoader extends BaseLoader {
  constructor(options?) {
    super({
        ...options,
        worker: Worker
    })
  }
  async beforeTranslate({ transpilingCode, path, manager}) {
      const denpencies = this.getDependencies(transpilingCode);
      await Promise.all(denpencies.map(async(denpency) => {
          return manager.traverseChildren(path, denpency);
      }));
      return denpencies;
  }
  async translate(ctx: Context, next?: any){
    const { transpilingCode, path, manager, isEntry } = ctx;
    let denpencies = await this.beforeTranslate({transpilingCode, path, manager});
    if (isEntry) {
      await new Promise((resolve, reject) => {
        let modules = {};
        manager.transpilerModules.forEach((transpilerModule) => {
            if ([FileType.SCSS, FileType.CSS].includes(transpilerModule.type)) {
                modules[transpilerModule.path] = transpilerModule.code;
            }
        })
        this.pushTaskToQueue(path, {
            code: transpilingCode,
            path: path,
            files: modules
        },  (error, result) => {
            ctx.error = error;
            ctx.transpilingCode = !error ? result.code : '';
            ctx.denpencies = denpencies;
            resolve(ctx);
        });
      })
    } else {
      ctx.error = new Error(`this module is not entry`);
      ctx.denpencies = denpencies;
      ctx.transpilingCode = '';
    }
    await next();
  }
  execute({ code, path }): Function {
    return function(module, exports, __edith_require__) {
          try{
            setStylesheet(code, path);
          } catch(error){
              // Todo log execute error
              console.log(error)
          }
      }
  }
  async afterTranslate() {

  }
  getDependencies(code: string): Array<string> {
    return getSassDependencies(code);
  }
}

export default new SassLoader();