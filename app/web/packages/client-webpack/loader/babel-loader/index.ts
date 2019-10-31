import BaseLoader from '../base-loader'
import Worker from 'worker-loader!./translate.worker.js';
import { boundClass } from 'autobind-decorator'
import Context from '../../utils/context'
@boundClass
export class BabelLoader extends BaseLoader {
    constructor(options) {
        super({
            ...options,
            worker: Worker
        })
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
        const {transpilingCode, path, manager } = ctx;
        const data:any = await new Promise((resolve, reject) => {
            this.pushTaskToQueue(path, {
                code: transpilingCode,
                path: path
            },  (error, result) => {
                ctx.error = error;
                ctx.transpilingCode = !error ? result.code : '';
                ctx.denpencies = result.denpencies;
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