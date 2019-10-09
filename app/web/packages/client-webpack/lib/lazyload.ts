let caches = {}
import BrowserFs from '@/packages/browserfs';
import path from 'path'
const ROOT = '/node_modules';
export default class Lazyload {
    constructor(packageName: string, version: string) {
        
    }
    public static async loadPackageJson(dep: string, version: string = 'lastest') {
        const url = `https://unpkg.com/${dep}@${version || 'lastest'}/package.json`;
        if (caches[url]) {
            return caches[url]
        }
        const result = await fetch(url).then((response) => response.json()).catch((error) => { return {}});

        caches[url] = result;
        return result
    }
    public static getPackageMeta() {

    }
    public static async getPackageFileContent(packageName, version, filepath, projectName: string = '') {
        const url = `https://unpkg.com/${packageName}@${version}${filepath ? `/${filepath}` : ''}`;
        const browserfsFilePath = path.join(projectName, ROOT, `${packageName}@${version}`, filepath || '');
        // const browserfsFilePath = `${projectName}/${ROOT}/${packageName}@${version}/${filepath}`
        const parsePath = path.parse(browserfsFilePath);
        // const cacheFileContent = await BrowserFs.getFileContent(browserfsFilePath);
        // if (!!cacheFileContent) {
        //     return cacheFileContent;
        // }
        const result: any = await fetch(url).then(async response => {
            const { url } = response;
            const parseUrl =  path.parse(url);
            const code = await response.text();
            return {
                code,
                fullPath: path.format({
                    ...parsePath,
                    dir: parsePath.dir.replace(`@${version}`, ''),
                    base: parseUrl.base
                })
            }
        });
        // BrowserFs.setFileContent(result.filepath, result.code);
        return result;
    }
}