import BaseLoader from '../base-loader'
import postcss from 'postcss';
import syntax, { parser }  from 'postcss-less'
import { setStylesheet } from '../../utils'
import lessBrowser from '@/packages/less-browser'
import getLessDependencies  from "./get-less-dependencies";

export default class LessLoader extends BaseLoader {
    constructor(options) {
        super(options);
    }
   async translate({ code, path }): Promise<{
        result: string,
        isError: boolean
    }> {
        try{
            // const result = postcss().process(code, { syntax, parser }).then((res) => {
            //     console.log(res)
            // });
            const less = lessBrowser(window, {filename: path, javascriptEnabled: true });
            const { css, imports } = await less.render(code || '');
            return {
                result: css,
                isError: false
            }
        } catch(error) {
            console.log(error)
            return {
                result: '',
                isError: true
            }
        }
        
    }
    execute({ code, path }): Function {
        return function(module, exports, __edith_require__) {
            try{
                setStylesheet(code, path);
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