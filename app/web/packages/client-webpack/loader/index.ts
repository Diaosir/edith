
// import BabelLoader from './babel-loader';
import File, { FileType } from '@/datahub/project/entities/file'
// import CssLoader from './css-loader';
// import LessLoader from './less-loader';
// import VueLoader from './vue-loader'
// import SassLoader from './scss-loader'
const cacheLoader: any = {}
export interface ILoader {
    translate: () => string;
    execute: () => Function;
}
export { default as BaseLoader } from './base-loader'
//TODO 动态加载
// export default function Loader(type: FileType, options?: any) {
//     if (cacheLoader[type]) {
//         return cacheLoader[type];
//     }
//     if(type === FileType.CSS) {
//         return cacheLoader[type] = CssLoader
//     }
//     if(type === FileType.LESS) {
//         return LessLoader;
//     }
//     if ([FileType.JS,FileType.JSX, FileType.TS, FileType.TSX].includes(type)) {
//         return BabelLoader;
//     }
//     if (type === FileType.VUE) {
//         return VueLoader;
//     }
//     if (type === FileType.SCSS) {
//         return SassLoader;
//     }
//     throw new Error(`not loader to handle ${type}`)
// }

export const defaultLoaderRules = {
    [FileType.LESS]: ['less', 'css'],
    [FileType.SCSS]: ['scss', 'css'],
    [FileType.JSX]: ['babel'],
    [FileType.JS]: ['babel'],
    [FileType.TS]: ['babel'],
    [FileType.TSX]: ['babel'],
    [FileType.VUE]: ['vue', 'babel'],
    [FileType.CSS]: ['css']
}