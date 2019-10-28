import BaseLoader from '../base-loader'
import parser from './parse'
import loader from './loader'
import Transpiler from '@/packages/client-webpack/lib/transpiler/transpiler'
import BabelLoader from '../babel-loader';
export class VueLoader extends BaseLoader {
    constructor(options) {
        super(options)
    }
    async afterTranslate({path, denpencies, context }) {
        await Promise.all(denpencies.map( async(denpency) => {
            return context.traverseChildren(path, denpency);
        }));
    }
    quit() {

    }
    async beforeTranslate({ code, path, context }) {
    }
    async translate({ code, path, context }): Promise<{
        result: string,
        isError: boolean,
        denpencies: Array<string>
    }> {
        const { transpiledCode } = await loader(code, path, {context: 'test'});
        const { isError, result, denpencies } =  await BabelLoader.translate({code: transpiledCode, path: path, context});
        if (denpencies) {
            await this.afterTranslate({path, denpencies: denpencies, context});
        }
        return {
            result: result,
            denpencies,
            isError: isError
        }
    }
    execute({ code, path }): Function {
        return function(module, exports, __edith_require__) {
            try{
                eval(`${code}\n//# sourceURL=edith:${path}?`)
            } catch(error){
                // Todo log execute error
                console.log(error)
            }
            
        }
    }
    getDependencies(code: string): Array<string> {
        return [];
    }
}

export default new VueLoader({});