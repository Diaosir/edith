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
    translate(code: string): {
        result: string,
        isError: boolean
    } {
        try{
            const root = postcss.parse(code);
            root.walk(function(node) {
                if (node.type === 'decl') {
                    // node.value = `url('https://cnt.ppmoney.com/static/v4.01/img/logos_97589d4.png')`
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
    execute(code: string): Function {
        const _this = this;
        return function(module, exports, __edith_require__) {
            try{
               setStylesheet(code, _this.path);
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
        // try{
        //     const root = postcss.parse(code);
        //     root.walk(function(node) {
        //         if (node.type === 'decl') {
        //             node.value = `url('https://cnt.ppmoney.com/static/v4.01/img/logos_97589d4.png')`
        //         }
        //     })
        //     console.log(root.toString())
        // } catch(error) {

        // }
        return [];
    }
}