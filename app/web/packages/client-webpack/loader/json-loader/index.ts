import BaseLoader from '../base-loader'
import Context from '../../utils/context';
import { boundClass } from 'autobind-decorator'
@boundClass
export class JSONLoader extends BaseLoader {
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
            const formatCode = JSON.stringify(JSON.parse(transpilingCode))
            const value = `module.exports = JSON.parse('${formatCode}')`;
            ctx.transpilingCode = value;
        } catch(error) {
            // TODO log
            ctx.error = error;
        }
       
    }
}

export default new JSONLoader();