import BaseLoader from '../base-loader'
import postcss from 'postcss';
import syntax, { parser }  from 'postcss-less'
import { setStylesheet } from '../../utils'
import less from 'less';
export default class LessLoader extends BaseLoader {
    constructor(options) {
        super(options);
    }
    translate(code: string): {
        result: string,
        isError: boolean
    } {
        try{
            // const result = postcss().process(code, { syntax, parser }).then((res) => {
            //     console.log(res)
            // });
            less.render(code).then((res) => {
                console.log(res)
            })
            return {
                result: '',
                isError: false
            }
        } catch(error) {
            return {
                result: '',
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
        return [];
    }
}