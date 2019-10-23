import BaseLoader from '../base-loader'
import { setStylesheet } from '../../utils'
import Transpiler from '@/packages/client-webpack/lib/transpiler/transpiler'
import getLessDependencies  from "./get-less-dependencies";
import Worker from 'worker-loader!./translate.worker.js';
import { FileType } from '@/datahub/project/entities/file'
export class LessLoader extends BaseLoader {
    constructor(options?) {
        super({
            ...options,
            worker: Worker
        })
   }
   async beforeTranslate({ code, path, context}) {
       const denpencies = this.getDependencies(code);
       await Promise.all(denpencies.map( async(denpency) => {
           return context.traverseChildren(path, denpency);
       }));
   }
   async afterTranslate() {
    return ''
   }
   async translate({ code, path, context, isEntry }): Promise<{
        result: string,
        isError: boolean,
        denpencies?: any
    }> {
        await this.beforeTranslate({code, path, context});
        //如果为less，仅编译入口文件
        if (isEntry) {
            return new Promise((resolve, reject) => {
                let modules = {};
                Transpiler.transpilerModules.forEach((transpilerModule) => {
                    if ([FileType.LESS, FileType.CSS].includes(transpilerModule.type)) {
                        modules[transpilerModule.path] = transpilerModule.code;
                    }
                })
                this.pushTaskToQueue(path, {
                    code: code,
                    path: path,
                    files: modules
                },  (error, result) => {
                    if (error) {
                        resolve({
                            isError: true,
                            result: error
                        })
                    } else {
                        resolve({
                            isError: false,
                            result: result.code,
                            denpencies: result.denpencies
                        })
                    }
                });
            });
        } else {
            return {
                isError: true,
                result: `this module is not entry`
            }
        }
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
    getDependencies(code: string): Array<string> {
        return getLessDependencies(code);
    }
}

export default new LessLoader();