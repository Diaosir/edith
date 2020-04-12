
// import BabelLoader from './babel-loader';
import File, { FileType } from 'edith-types/lib/file'
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

export const defaultLoaderRules = {
    [FileType.LESS]: ['less-loader', 'css-loader'],
    [FileType.SCSS]: ['scss-loader', 'css-loader'],
    [FileType.JSX]: ['babel-loader'],
    [FileType.JS]: ['babel-loader'],
    [FileType.TS]: ['babel-loader'],
    [FileType.TSX]: ['babel-loader'],
    [FileType.VUE]: ['vue-loader', 'babel-loader'],
    [FileType.CSS]: ['css-loader']
}
export function formatLoader(code: string) {
    const loaders = code.replace(/^-?!+/, "")
    .replace(/!!+/g, "!")
    .split("!")
    const filename = loaders.pop();
    return {
        filename,
        loaders
    }
  }