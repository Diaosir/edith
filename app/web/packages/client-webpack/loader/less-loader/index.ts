import BaseLoader from '../base-loader'
import postcss from 'postcss';
import syntax, { parser }  from 'postcss-less'
import { setStylesheet } from '../../utils'
import lessBrowser from '@/packages/less-browser'
import getLessDependencies  from "./get-less-dependencies";
const less = lessBrowser(window, {parentPath: ''})
export default class LessLoader extends BaseLoader {
    constructor(options) {
        super(options);
    }
   async translate(code: string): Promise<{
        result: string,
        isError: boolean
    }> {
        try{
            // const result = postcss().process(code, { syntax, parser }).then((res) => {
            //     console.log(res)
            // });
            less.options = {
                ...less.options,
                parentPath: this.path
            }
            const { css, imports } = await less.render(code, { parentPath: this.path });
            return {
                result: css,
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
            } catch(error){
                // Todo log execute error
                console.log(error)
            }
        }
    }
    getDependencies(code: string): Array<string> {
        return getLessDependencies(code);
    }
}