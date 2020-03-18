import { IFileSystemProvider, FileWriteOptions, IStat, FileType} from './file'
import { getAllEnablePaths } from '@/utils/path';
import { URI, UriComponents } from '../../lib/Uri'
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
}