import BaseLoader from '../base-loader'
import Worker from 'worker-loader!./translate.worker.js';
import { FileType } from 'edith-types/lib/file'
import { setStylesheet, getDependenciesModulesFiles } from '../../utils'
import getSassDependencies  from "./get-sass-dependencies";
import Context from '../../utils/context'
import { boundClass } from 'autobind-decorator'
import * as _ from 'lodash'
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
    const { transpilingCode, path, manager, isEntry, node_modules_path } = ctx;
    let denpencies = await this.beforeTranslate({transpilingCode, path, manager});
    if (isEntry) {
      await new Promise(async (resolve, reject) => {
        let files = await getDependenciesModulesFiles(manager.transpilerModules, (module) => [FileType.SCSS, FileType.CSS].includes(module.type))
        this.pushTaskToQueue(path, {
            code: transpilingCode,
            path: path,
            files: files,
            node_modules_path: node_modules_path
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