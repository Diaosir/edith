import BaseLoader from '../base-loader'
import loader from './loader'
import BabelLoader from '../babel-loader';
import Context from '../../utils/context'
import { boundClass } from 'autobind-decorator'
@boundClass
export class VueLoader extends BaseLoader {
    constructor(options) {
        super(options)
    }
    async afterTranslate({path, denpencies, manager }) {
        await Promise.all(denpencies.map( async(denpency) => {
            return manager.traverseChildren(path, denpency);
        }));
    }
    async beforeTranslate({ code, path, context }) {
    }
    async translate(ctx: Context, next?: any) {
        const { transpilingCode, path, manager } = ctx;
        const { transpiledCode } = await loader(transpilingCode, path, manager, {context: manager.name});
        ctx.transpilingCode = transpiledCode;
        await next();
    }
}

export default new VueLoader({});