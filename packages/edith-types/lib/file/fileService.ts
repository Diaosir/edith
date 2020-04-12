import { 
  IFileSystemProvider, 
  FileWriteOptions, 
  IStat, 
  FileType
} from 'edith-types/lib/file/file';
import { getAllEnablePaths, resolve } from 'edith-utils/lib/path';
import { URI } from 'edith-types/lib/uri' 
import * as path from 'path'
import * as is from 'is'
const { TextEncoder, TextDecoder } = require('@exodus/text-encoding-utf8')
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder()
export interface IFileService {
  registerProvider(scheme: string, provider: IFileSystemProvider): any;
}
export interface IFileServiceReadFileResp {
  code: string;
  resource: URI;
  exit: boolean;
}
export default class FileServie implements IFileService {
  private readonly provider = new Map<string, IFileSystemProvider>();
  constructor() {
  }
  registerProvider(scheme: string, provider: IFileSystemProvider) {
    if (this.provider.has(scheme)) {
			throw new Error(`A provider for the scheme ${scheme} is already registered.`);
    }
    // Add provider with event
		this.provider.set(scheme, provider);
  }
  getProvider(scheme: string): IFileSystemProvider {
    if (!this.provider.has(scheme)) {
			throw new Error(`can not find provider for the scheme ${scheme}`);
    }
    return this.provider.get(scheme);
  }
  async writeFile(resource: URI, content: string, opts?: FileWriteOptions): Promise<void>{
    const fileProvider = this.getProvider(resource.scheme);
    let dirname = this._dirname(resource.path)
    let parts = dirname.split('/');
    let file = ''
    for (const part of parts) {
      if(part === ''){
        continue;
      }
      file += `/${part}`
      const uri = resource.with({
        path: file
      })
      const stat = await fileProvider.stat(uri, true);
      if(!stat) { //不存在
        await fileProvider.mkdir(uri);
      }
		}
    
    return fileProvider.writeFile(resource, textEncoder.encode(content), {
      overwrite: true,
      create: true,
      ...opts
     })
  }
  async readFile(resource: URI): Promise<IFileServiceReadFileResp>{
    const fileProvider = this.getProvider(resource.scheme);
    let result = {
      code: '',
      resource,
      exit: false
    }
    const { stat, resource: realResource } = await this.stat(resource);
    if(stat) {
      const data = await fileProvider.readFile(realResource);
      result.resource = realResource;
      result.exit = true;
      result.code = typeof data === 'string' ? data : textDecoder.decode(data)
    }
    return result;
  }
  async stat(resource: URI): Promise<{
    stat: IStat,
    resource: URI
  }>{
    const fileProvider = this.getProvider(resource.scheme);
    let allList = getAllEnablePaths(['js', 'jsx', 'ts', 'tsx', 'vue'], resource.fsPath);
    for(let i = 0; i < allList.length; i++) {
      const uri = URI.revive({
        scheme: resource.scheme,
        path: allList[i],
        authority: '',
        query: '',
        fragment: ''
      })
      try{ //查询文件
        const stat = await fileProvider.stat(uri);
        if(stat.type === FileType.File) {
          return {
            stat,
            resource: uri
          };
        }
      } catch(error) {
      }
    }
    return {
      stat: undefined,
      resource
    };
  }
  async resolve(resource: URI, parent: URI, nodeModulesPath: string): Promise<string> {
    let basePath = parent ? resolve(parent.fsPath, resource.fsPath) : '';
    let filename = await this._resolve(resource.with({
      path: basePath
    }));
    // if(!path.isAbsolute(basePath)) {
    //   basePath = path.join(no)
    // }
    if(!filename) {
      basePath = path.join(nodeModulesPath, resource.fsPath);
      filename = await this._resolve(resource.with({
        path: basePath
      }));
    }
    return filename ? `${filename.match(/^\//) ? '' : '/'}${filename}` : ''
  }
  private _dirname(path: string): string {
		path = this._rtrim(path, '/');
		if (!path) {
			return '/';
		}

		return path.substr(0, path.lastIndexOf('/'));
	}
	private _rtrim(haystack: string, needle: string): string {
		if (!haystack || !needle) {
			return haystack;
		}

		const needleLen = needle.length,
			haystackLen = haystack.length;

		if (needleLen === 0 || haystackLen === 0) {
			return haystack;
		}

		let offset = haystackLen,
			idx = -1;

		while (true) {
			idx = haystack.lastIndexOf(needle, offset - 1);
			if (idx === -1 || idx + needleLen !== offset) {
				break;
			}
			if (idx === 0) {
				return '';
			}
			offset = idx;
		}

		return haystack.substring(0, offset);
  }
  private async _resolve(resource: URI): Promise<string> {
    let filename;
    const basePath = resource.fsPath;
    if(!basePath.match(/\/$/)) {
      const { stat, resource: realResource } = await this.stat(resource);
      if(stat && stat.type === FileType.File) {
        filename = realResource.fsPath;
      } else if(stat && stat.type === FileType.Directory) {
        filename = await this._tryPackage(resource);
      }
    }
    if(!filename) {
      filename = await this._tryPackage(resource);
    }
    if(!filename) {
      const { stat, resource: realResource } = await this.stat(resource.with({
        path: resolve(resource.fsPath, 'index')
      }));
      if(stat) {
        filename = realResource.fsPath;
      }
    }
    return filename;
  }
  private async _tryPackage(resource: URI) {
    const packageResource = resource.with({
      path: resolve(resource.fsPath, 'package.json')
    });
    let filenames = [];
    try{
      const fileProvider = this.getProvider(packageResource.scheme);
      const json = await fileProvider.readFile(packageResource);
      const packageJson = JSON.parse(typeof json === 'string' ? json : textDecoder.decode(json));
      const entry = resolve(resource.fsPath, packageJson.main || 'index.js');
      const browserMaps = this._tryBrowserPath(packageJson.browser, packageResource.fsPath)
      if(is.object(browserMaps) && browserMaps[entry]) {
        filenames.push(browserMaps[entry])
      }
      if(entry) {
        filenames.push(entry);
      }
    } catch(error) {
      error.path = packageResource.fsPath;
      error.message = 'Error parsing ' +  packageResource.fsPath + ': ' + error.message;
    }
    if(filenames.length === 0) return false;
    for(let i = 0; i < filenames.length; i++) {
      const entryResource = resource.with({ path : filenames[i] });
      const { stat, resource: realEntryResource} = await this.stat(entryResource);
      if(stat) {
        return realEntryResource.fsPath;
      }
    }
    return '';
  }
  /**
   * Rewrite the paths of the browser aliases to the relative path to the package
   * @param browser
   */
  private _tryBrowserPath(
    browser: { [path: string]: string }, 
    packagePath: string
    ) {
      if(!is.object(browser)) {
        return null
      }
      return Object.keys(browser).reduce((total, next) => {
        const browserPath = browser[next] ? resolve(packagePath, browser[next]) : '';
        if(!browserPath) {
          return total
        }
        return {
          ...total,
          [resolve(packagePath, next)]: browserPath,
        };
      }, {});
  }
}