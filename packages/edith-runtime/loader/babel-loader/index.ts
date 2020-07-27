import BaseLoader from '../base-loader'
import Worker from 'worker-loader!./translate.worker.js';
import { boundClass } from 'autobind-decorator'
import Context from '../../utils/context'
import { getOptionsByFileType, defaultOptions } from './options'
import md5 from 'edith-utils/lib/md5';
import { URI } from '@/packages/edith-types/lib/uri';
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
        const fileId = md5(transpilingCode + path);
        const cacheResource = URI.parse(`translate:/${fileId}`);
        let data: any= null;
        if(path.includes('/node_modules')) {
            try{
                const stat = await this.translateCacheFileSystem.stat(cacheResource, true);
                if(stat) { //存在缓存
                    const cacheData: any = await this.translateCacheFileSystem.readFile(cacheResource);
                    data = JSON.parse(cacheData);
                    ctx.denpencies = data.denpencies;
                    ctx.transpilingCode = data.transpiledCode;
                }
            } catch(error) {
            }
        } else {
            console.log(path)
        }
        if(!data) {
            data = await new Promise((resolve, reject) => {
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
            path.includes('/node_modules') && await this.translateCacheFileSystem.writeFileAnyway(URI.parse(`translate:/${fileId}`), JSON.stringify({
                denpencies: data.denpencies,
                transpiledCode: data.transpilingCode
            }));
        }
        await next();
        if (data.denpencies) {
            await this.afterTranslate({path, denpencies: data.denpencies, manager});
        }
    }
}
export default new BabelLoader({});