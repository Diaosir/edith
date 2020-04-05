import LoadWorker from 'worker-loader!./load.worker';
let caches = {}

import path from 'path'
import { parse, normalize, resolve } from '@/utils/path'
import md5 from '@/utils/md5'
import BrowserFs from '@/packages/browserfs';
import FileManager from '../../lib/file-manager'
const ROOT = '/node_modules';
const UNPKG_URL = 'https://unpkg.com';
const loadWorker = new LoadWorker();
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
        // const resultText = await new Promise((resolve, reject) => {
        //     loadWorker.postMessage({
        //         type: 'lazyload-npm-module',
        //         payload: {
        //             url: normalize(url)
        //         }
        //     })
        //     loadWorker.onmessage = function(ev: MessageEvent) {
        //         const { data } = ev;
        //         if (data && data.type === `lazyload-npm-module-result-${normalize(url)}` ) {
        //             const { result, error } = data.payload;
        //             if (error) {
        //                 resolve(null)
        //             } else {
        //                 resolve(result)
        //             }
        //         }
        //     }
        // })
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
            return {
                code,
                fullPath
            };
        } else {
            console.log(`${browserfsFilePath}不在缓存中`)
        }
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
            !result.isError && BrowserFs.setFileContent(result.fullPath, result.code);
            return result;
        }
        return doFetch(url);
    }
}