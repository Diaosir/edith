import BaseLoader from '../base-loader'
import * as Compiler from 'vue-template-compiler';
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
    async translate({ code }): Promise<{
        result: string,
        isError: boolean
    }> {
      const res = Compiler.parseComponent(code);
      console.log(res)
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