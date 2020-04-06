import BaseLoader from '../base-loader'
import getLessDependencies  from "./get-less-dependencies";
import Worker from 'worker-loader!./translate.worker.js';
import { FileType } from 'edith-types/lib/file'
import Context from '../../utils/context'
import { boundClass } from 'autobind-decorator'
import { getDependenciesModulesFiles } from '../../utils'

@boundClass
export class LessLoader extends BaseLoader {
    constructor(options?) {
        super({
            ...options,
            worker: Worker
        })
   }
//    quit(modulePath) {
//        //保留dom
//        deleteStylesheet(modulePath)
//    }
   async beforeTranslate({ transpilingCode, path, manager}) {
       const denpencies = this.getDependencies(transpilingCode);
       await Promise.all(denpencies.map(async(denpency) => {
           return manager.traverseChildren(path, denpency);
       }));
       return denpencies;
   }
   async afterTranslate() {
    return ''
   }
   async translate(ctx: Context, next?: any) {
        const { transpilingCode, path, manager, isEntry } = ctx;
        let denpencies = await this.beforeTranslate({transpilingCode, path, manager});
        //如果为less，仅编译入口文件
        if (isEntry) {
            await new Promise(async (resolve, reject) => {
                let modules = await getDependenciesModulesFiles(manager.transpilerModules, (module) => [FileType.LESS, FileType.CSS].includes(module.type))
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
            });
        } else {
            ctx.error = new Error(`this module is not entry`);
            ctx.denpencies = denpencies;   
            ctx.transpilingCode = ''
        }
        await next();
    }
    getDependencies(code: string): Array<string> {
        return getLessDependencies(code);
    }
}

export default new LessLoader();