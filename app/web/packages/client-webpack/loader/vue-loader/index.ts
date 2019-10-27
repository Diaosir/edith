import BaseLoader from '../base-loader'
import parser from './parse'
import loader from './loader'
export class VueLoader extends BaseLoader {
    constructor(options) {
        super(options)
    }
    async afterTranslate() {

    }
    quit() {

    }
    async beforeTranslate() {

    }
    async translate({ code, path }): Promise<{
        result: string,
        isError: boolean
    }> {
        console.log(loader(code, path, {context: 'test'}))
        return {
            result: '',
            isError: false
        }
    }
    execute({ code, path }): Function {
        return function(module, exports, __edith_require__) {
            try{
                exports.default = {
                }
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