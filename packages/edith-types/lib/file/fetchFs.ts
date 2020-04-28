
import { File, Directory, FileType, IStat, FileSystemProviderErrorCode, FileSystemProviderError, FileWriteOptions, IFileChange, FileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability } from './file';
import { URI } from 'edith-types/lib/uri'
import md5 from 'edith-utils/lib/md5';
import MemFs from './memfs'
import LocalStorageFs from './localStorageFs';
import IndexedDBFs from './indexedDBFs'
const { TextEncoder, TextDecoder} = require('@exodus/text-encoding-utf8')
import superagent from 'superagent'
import { resolve, join } from 'path-browserify'
const textDecoder = new TextDecoder()
export type Entry = File | Directory;
export default class FetchStorageFileSystemProvider extends IndexedDBFs implements IFileSystemProviderWithFileReadWriteCapability {
  public fetchCache: WeakMap<URI, any> = new WeakMap();
	public scheme: string = 'remote';
	public host: string;
	constructor(scheme: string, host?: string) {
		super(scheme);
		this.scheme = scheme;
		this.host = host
	}
	async readFile(resource: URI): Promise<Uint8Array> {
		try{
			const stat = await this.stat(resource, true);
			if(stat.type === FileType.Directory) {
			 let redirectResource = resource.with({
					path: join(resource.fsPath, 'redirect.json')
				});
				const redirectJsonStr = await super.readFile(redirectResource)
				const redirectJson = JSON.parse(typeof redirectJsonStr === 'string' ? redirectJsonStr : textDecoder.decode(redirectJsonStr));
				resource = resource.with({
					path: redirectJson.main
				});
			}
			const cache = await super.readFile(resource)
			return typeof cache === 'string' ? cache : textDecoder.decode(cache);
		} catch(error){
		}
		const cached = this.fetchCache.get(resource);
		let promise = null;
		if(!!cached) {
			promise = cached;
		} else {
			promise = this._fetchFile(resource);
			this.fetchCache.set(resource, promise);
		}
    const data: any = await promise;
		if (data) {
			return data;
		}
		throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
	}
	private async _fetchFile(resource: URI): Promise<string> {
		const host = this.host;
		const url = `${host}${resource.fsPath}`;
		async function doFetch(url) {
			let result = await superagent.get(url).then((response) => {
				const code = response.text || (response.body ? response.body.toString() : '');
				const responseURL = response.xhr ? response.xhr.responseURL : url;
				let result = {
						code,
						isError: response.status == 404,
						responseURL
				}
				return result;
			}).catch((error) => {
				return {
					code: error.response.text,
					isError: true
				}
			})
			if (result.isError && result.code.indexOf('Cannot find an index') > -1) { //处理获取不到的情况
				try{
					const { code, isError } = await doFetch(`${url}/package.json`);
					const packageJson = JSON.parse(code);
					if(packageJson.main){
						result = await doFetch(`${host}${resolve(resource.fsPath, packageJson.main)}`);
					}
				} catch(error) {
					// console.log(error)
				}
			}
			return result;
		}
		console.log(url)
		let { code, responseURL } = await doFetch(url);
		const realFilename = this._getRealFilename(responseURL);
		const relativePath = responseURL.replace(this.host, '')
		code = `${code} //realFilename=${realFilename}`;
		if(relativePath === resource.fsPath) {
			await super.writeFileAnyway(resource, code)
		} else {
			const pkg = {
				main: relativePath
			}
			await super.writeFileAnyway(resource.with({
				path: join(resource.fsPath, 'redirect.json')
			}), JSON.stringify(pkg))
		}
		await super.writeFileAnyway(resource.with({
			path: relativePath
		}), code)
		return code
	}
	private _getRealFilename(url: string) {
		return url.replace(this.host, '').split('/').map(part => {
			if(part.match(/@\d+\./)) {
				const packageParts = part.split("@");
				const version = packageParts.pop();
				const packageName = packageParts.join("@") || '';
				return packageName;
			} else {
				return part
			}
		}).join('/')
	}
}