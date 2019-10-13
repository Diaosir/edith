
import BabelLoader from './babel-loader';
import { FileType } from '@/datahub/project/entities/file'
import CssLoader from './css-loader';
import LessLoader from './less-loader';
export interface ILoader {
    translate: () => string;
    execute: () => Function;
}
export { default as BaseLoader } from './base-loader'
export default function Loader(type: FileType, options) {
    if(type === FileType.CSS) {
        return new CssLoader(options)
    }
    if(type === FileType.LESS) {
        return new LessLoader(options)
    }
    return new BabelLoader(options)
}