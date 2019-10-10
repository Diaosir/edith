let caches = {}
import BrowserFs from '@/packages/browserfs';
import path from 'path'
import { parse, normalize } from '@/utils/path'
import md5 from '@/utils/md5'
const ROOT = '/node_modules';
const UNPKG_URL = 'https://unpkg.com';
export default class Lazyload {
    constructor(packageName: string, version: string) {
        
    }
    public static async loadPackageJson(dep: string, version: string = '') {
        const url = `${UNPKG_URL}/${dep}${version ? `@${version}` : '' }/package.json`;
        const baseUrl = md5(url);
        const { code } = await BrowserFs.getFileContent(baseUrl);
        if (code) {
            return JSON.parse(code)
        }
        const result = await fetch(normalize(url)).then((response) => response.json()).catch((error) => { return {}});
        BrowserFs.setFileContent(baseUrl, JSON.stringify(result));
        return result
    }
    public static getPackageMeta() {

    }
    public static async getPackageFileContent(packageName, version, filepath, projectName: string = '') {
        const url = `${UNPKG_URL}/${packageName}@${version}${filepath ? `/${filepath}` : ''}`;
        const browserfsFilePath = normalize(path.join(projectName, ROOT, `${packageName}@${version}`, filepath || ''));
        const {code, fullPath} = await BrowserFs.getFileContent(browserfsFilePath);
        if (!!code) {
            // console.log(fullPath)
            return {
                code,
                fullPath
            };
        }
        const result: any = await fetch(normalize(url)).then(async response => {
            const { url } = response;
            const parseUrl =  parse(url);
            const code = await response.text();
            const dir = parseUrl.dir.replace(UNPKG_URL, path.join(projectName, ROOT))
            const fullPath = path.format({
                ...parseUrl,
                dir: dir,
                base: parseUrl.base
            })
            return {
                code,
                fullPath: normalize(fullPath)
            }
        });
        BrowserFs.setFileContent(result.fullPath, result.code);
        return result;
    }
}