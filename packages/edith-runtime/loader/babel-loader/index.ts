import BaseLoader from '../base-loader'
import Worker from 'worker-loader!./translate.worker.js';
import { boundClass } from 'autobind-decorator'
import Context from '../../utils/context'
import { getOptionsByFileType, defaultOptions } from './options'
@boundClass
export class BabelLoader extends BaseLoader {
    public babelOptions: any = defaultOptions;
    constructor(options) {
        super({
            ...options,
            worker: Worker
        });
    }
    /**
     * nothing
     *
     * @memberof BabelLoader
     */
    quit(modulePath) {

    }
    async beforeTranslate() {
        return ''
    }
    async afterTranslate({path, denpencies, manager }) {
        await Promise.all(denpencies.map( async(denpency) => {
            return manager.traverseChildren(path, denpency);
        }));
    }
    async translate(ctx: Context, next?: any){
        const {transpilingCode, path, manager, type } = ctx;
        const babelOptions = getOptionsByFileType(type);
        const data:any = await new Promise((resolve, reject) => {
            this.pushTaskToQueue(path, {
                code: transpilingCode,
                path: path,
                babelOptions
            },  (error, result) => {
                ctx.error = error;
                if (result) {
                    ctx.transpilingCode = !error ? result.code : '';
                    ctx.denpencies = result.denpencies;
                }
                resolve(ctx);
            });
        });
        await next();
        if (data.denpencies) {
            await this.afterTranslate({path, denpencies: data.denpencies, manager});
        }
    }
}
export default new BabelLoader({});