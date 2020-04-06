import BaseLoader from '../base-loader'
import postcss from 'postcss';
import postcssJs from 'postcss-js'
import autoprefixer from 'autoprefixer'
import { setStylesheet } from '../../utils'
import Context from '../../utils/context';
var prefixer = postcssJs.sync([ require('autoprefixer') ])
import { boundClass } from 'autobind-decorator'
@boundClass
export class CssLoader extends BaseLoader {
    constructor(options?) {
        super(options)
    }
    async afterTranslate() {

    }
    async beforeTranslate() {

    }
    async translate(ctx: Context, next?: any) {
        try{
            const { transpilingCode } = ctx;
            const result = await postcss([ autoprefixer ]).process(transpilingCode || '');
            result.warnings().forEach(warn => {
                console.warn(warn.toString())
            })
            ctx.transpilingCode = result.css;
        } catch(error) {
            // TODO log
            ctx.error = error;
        }
       
    }
}

export default new CssLoader();