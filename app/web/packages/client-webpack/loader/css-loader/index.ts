import BaseLoader from '../base-loader'
import postcss from 'postcss';
import postcssJs from 'postcss-js'
import autoprefixer from 'autoprefixer'
import { setStylesheet } from '../../utils'
var prefixer = postcssJs.sync([ require('autoprefixer') ])
export default class CssLoader extends BaseLoader {
    private _
    constructor(options) {
        super(options)
    }
    async translate({ code }): Promise<{
        result: string,
        isError: boolean
    }> {
        try{
            const root = postcss.parse(code);
            root.walk(function(node) {
                if (node.type === 'decl') {

                }
            })
            return {
                result: root.toString(),
                isError: false
            }
        } catch(error) {
            // TODO log
            return {
                result: error,
                isError: true
            }
        }
       
    }
    execute({ code, path }): Function {
        return function(module, exports, __edith_require__) {
            try{
               setStylesheet(code, path);
                exports.default = {
                }
            } catch(error){
                // Todo log execute error
                console.log(error)
            }
        }
    }
    getDependencies(code: string): Array<string> {
        let dependencies = [];
        return [];
    }
}