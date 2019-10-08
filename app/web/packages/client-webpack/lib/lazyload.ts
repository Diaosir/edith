let caches = {}
import BrowserFs from '@/packages/browserfs';
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
    public static async getPackageFileContent(packageName, version, filepath) {
        const url = `https://unpkg.com/${packageName}@${version}/${filepath}`;
        const browserfsFilePath = `${ROOT}/${packageName}_${version}/${filepath}`
        const cacheFileContent = await BrowserFs.getFileContent(browserfsFilePath);
        if (!!cacheFileContent) {
            return cacheFileContent;
        }
        try {
            const result = await fetch(url).then(response => response.text());
            BrowserFs.setFileContent(browserfsFilePath, result);
            return result;
        } catch(error) {
            return ''
        }
    }
}