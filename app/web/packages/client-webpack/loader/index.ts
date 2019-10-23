
import BabelLoader from './babel-loader';
import { FileType } from '@/datahub/project/entities/file'
import CssLoader from './css-loader';
import LessLoader from './less-loader';
const cacheLoader: any = {}
export interface ILoader {
    translate: () => string;
    execute: () => Function;
}
export { default as BaseLoader } from './base-loader'
//TODO 动态加载
export default function Loader(type: FileType, options?: any) {
    if (cacheLoader[type]) {
        return cacheLoader[type];
    }
    if(type === FileType.CSS) {
        return cacheLoader[type] = new CssLoader(options)
    }
    if(type === FileType.LESS) {
        return LessLoader;
    }
    return BabelLoader;
}