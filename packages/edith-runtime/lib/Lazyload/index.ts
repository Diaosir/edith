
import path from 'path'
import { parse, normalize, resolve } from 'edith-utils/lib/path'
const ROOT = '/node_modules';
const UNPKG_URL = 'https://unpkg.com';
export default class Lazyload {
    constructor(packageName: string, version: string) {
        
    }
    public static async loadPackageJson(dep: string, version: string = '') {
        const url = `${UNPKG_URL}/${dep}${version ? `@${version}` : '' }/package.json`;
        const result = await fetch(normalize(url)).then((response) => response.json()).catch((error) => { return {}});
        return result
    }
    public static getPackageMeta() {

    }
    public static async getPackageFileContent(packageName, version, filepath, projectName: string = '') {
        const url = `${UNPKG_URL}/${packageName}@${version}${filepath ? `/${filepath}` : ''}`;
        async function doFetch(url) {
            let result: any = await fetch(normalize(url)).then(async response => {
                const { url, status } = response;
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
                    fullPath: normalize(fullPath).replace(`@${version}`, ''),
                    isError: status == 404
                }
            });
            
            if (result.isError && result.code.indexOf('Cannot find an index') > -1) { //处理获取不到的情况
                const packageJsonConent = await fetch(`${url}/package.json`).then((response) => response.json()).catch((error) => { return {}});
                if (packageJsonConent.main) {
                    result = await doFetch(resolve(url, packageJsonConent.main));
                    result.main = packageJsonConent.main;
                }
            }
            // !result.isError && BrowserFs.setFileContent(result.fullPath, result.code);
            return result;
        }
        return doFetch(url);
    }
}