
import { File, Directory, FileType, IStat, FileSystemProviderErrorCode, FileSystemProviderError, FileWriteOptions, IFileChange, FileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, FileChangeType, FileDeleteOptions} from './file';
import { URI } from 'edith-types/lib/uri'
import md5 from 'edith-utils/lib/md5';
import MemFs from './memfs'
const { TextEncoder, TextDecoder} = require('@exodus/text-encoding-utf8')
import superagent from 'superagent'
import { resolve, join } from 'path-browserify'
const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()
export type Entry = File | Directory;

export default class IndexedDBFsFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {
  public fileCache: Map<string, string> = new Map();
	public scheme: string = 'indexedDb';
  public db_instance: IDBDatabase;
  public dbVersion: number = 2;
  public dbName: string = 'node_modules';
  root = new Directory('');
	constructor(scheme: string) {
    this.scheme = scheme
    this._init();
  }
  private async _init() {
    const db = await this._getDbInstance();
    if(db) {
      const transaction = db.transaction(this.scheme, "readwrite");
      let objectStore = transaction.objectStore(this.scheme);
      var allRecords = objectStore.getAll();
      const now = Date.now()
      allRecords.onsuccess = () => {
        if(Array.isArray(allRecords.result)) {
          allRecords.result.map((item) => {
            this.writeFileAnyway(URI.parse(`${this.scheme}:${item.path}`), item.value);
          })
        }
      };
      this.db_instance = db;
    }
  }
  private async _getDbInstance() {
    const _this = this;
    if(!!this.db_instance) {
      return this.db_instance;
    }
    const db: any = await new Promise((resolve, reject) => {
      var res = indexedDB.open(this.dbName, this.dbVersion);
      res.onsuccess = function (ev: Event) {
          resolve(res.result)
      };
      res.onerror = function (ev: Event) {
          resolve(false)
      };
      res.onupgradeneeded = function(event) {
        let db = res.result;
        let objectStore = db.createObjectStore(_this.scheme, { 
          keyPath: 'path'
        });
        objectStore.createIndex('path', 'path', {
          unique: true    
        });
        objectStore.createIndex('value', 'value');
      };
    })
    this.db_instance = db;
    return db;
  }
	async stat(resource: URI, silent:boolean = false): Promise<IStat> {
		return this._lookup(resource, silent);
	}

	async readdir(resource: URI): Promise<[string, FileType][]> {
		const entry = this._lookupAsDirectory(resource, false);
		let result: [string, FileType][] = [];
		for (const [name, child] of entry.entries) {
			result.push([name, child.type]);
		}
		return result;
	}

	// --- manage file contents

	async readFile(resource: URI): Promise<Uint8Array> {
    const db_instance = await this._getDbInstance();
    const entry = this._lookupAsFile(resource, false);
		if (entry instanceof File) {
      // 获取成功后替换当前数据
      const record = await new Promise((resolve, reject) => {
        const transaction = db_instance.transaction(this.scheme, "readwrite");
        let objectStore = transaction.objectStore(resource.scheme);
        let objectStoreRequest = objectStore.get(resource.fsPath);
        objectStoreRequest.onsuccess = function(event: Event) {
          // 数据
          var record = objectStoreRequest.result;
          // 更新数据库存储数据             
          resolve(record.value);
        }
        objectStoreRequest.onerror = function(e) {
          console.log(e);
          reject('error')
        };
      })
      if(record) {
        return textEncoder.encode(record);
      }
    }
		throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
	}

	async writeFile(resource: URI, content: Uint8Array, opts: FileWriteOptions): Promise<void> {
		let basename = this._basename(resource.path);
		let parent = this._lookupParentDirectory(resource);
		let entry = parent.entries.get(basename);
		if (entry instanceof Directory) {
			throw new FileSystemProviderError('file is directory', FileSystemProviderErrorCode.FileIsADirectory);
		}
		if (!entry && !opts.create) {
			throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
		}
		if (entry && opts.create && !opts.overwrite) {
			throw new FileSystemProviderError('file exists already', FileSystemProviderErrorCode.FileExists);
		}
		if (typeof content === 'string') {
			content = textEncoder.encode(content);
		}
		if (!entry) {
			entry = new File(basename);
			parent.entries.set(basename, entry);
			this._fireSoon({ type: FileChangeType.ADDED, resource });
		}
		entry.mtime = Date.now();
    entry.size = content.byteLength;
    
    const db_instance = await this._getDbInstance();
    const transaction = db_instance.transaction(this.scheme, "readwrite");
    let objectStore = transaction.objectStore(this.scheme);
    objectStore.add({
      path: resource.fsPath,
      value: textDecoder.decode(content)
    });
		// entry.data = content;

		this._fireSoon({ type: FileChangeType.UPDATED, resource });
	}
  async writeFileAnyway(resource: URI, content: string, opts: FileWriteOptions = { create: true, overwrite: true}) {
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
      const stat = await this.stat(uri, true);
			if(!stat) { //不存在
        await this.mkdir(uri);
      }
		}
		await this.writeFile(resource, textEncoder.encode(content), opts)
	}
	// --- manage files/folders

	async rename(from: URI, to: URI, opts: FileOverwriteOptions): Promise<void> {
		if (!opts.overwrite && this._lookup(to, true)) {
			throw new FileSystemProviderError('file exists already', FileSystemProviderErrorCode.FileExists);
		}

		let entry = this._lookup(from, false);
		let oldParent = this._lookupParentDirectory(from);

		let newParent = this._lookupParentDirectory(to);
		let newName = this._basename(to.path);

		oldParent.entries.delete(entry.name);
		entry.name = newName;
		newParent.entries.set(newName, entry);

		this._fireSoon(
			{ type: FileChangeType.DELETED, resource: from },
			{ type: FileChangeType.ADDED, resource: to }
		);
	}

	async delete(resource: URI, opts: FileDeleteOptions): Promise<void> {
		let dirname = resource.with({
			path: this._dirname(resource.path)
		});
		let basename = this._basename(resource.path);
		let parent = this._lookupAsDirectory(dirname, false);
		if (!parent.entries.has(basename)) {
			throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
		}
		parent.entries.delete(basename);
		parent.mtime = Date.now();
		parent.size -= 1;
		this._fireSoon({ type: FileChangeType.UPDATED, resource: dirname }, { resource, type: FileChangeType.DELETED });
	}

	async mkdir(resource: URI): Promise<void> {
		let basename = this._basename(resource.path);
		let dirname = resource.with({
			path: this._dirname(resource.path)
		});
		let parent = this._lookupAsDirectory(dirname, false);

		let entry = new Directory(basename);
		parent.entries.set(entry.name, entry);
		parent.mtime = Date.now();
		parent.size += 1;
		this._fireSoon({ type: FileChangeType.UPDATED, resource: dirname }, { type: FileChangeType.ADDED, resource });
	}

  // --- lookup

	protected _lookup(uri: URI, silent: false): Entry;
	protected _lookup(uri: URI, silent: boolean): Entry | undefined;
	protected _lookup(uri: URI, silent: boolean): Entry | undefined {
		let parts = uri.path.split('/');
		let entry: Entry = this.root;
		for (const part of parts) {
			if (!part) {
				continue;
			}
			let child: Entry | undefined;
			if (entry instanceof Directory) {
				child = entry.entries.get(part);
			}
			if (!child) {
				if (!silent) {
					throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
				} else {
					return undefined;
				}
			}
			entry = child;
		}
		return entry;
	}

	protected _lookupAsDirectory(uri: URI, silent: boolean): Directory {
		if(uri.fsPath === '') {
			return this.root;
		}
		let entry = this._lookup(uri, silent);
		if (entry instanceof Directory) {
			return entry;
		}
		throw new FileSystemProviderError('file not a directory', FileSystemProviderErrorCode.FileNotADirectory);
	}

	protected _lookupAsFile(uri: URI, silent: boolean): File {
		let entry = this._lookup(uri, silent);
		if (entry instanceof File) {
			return entry;
		}
		throw new FileSystemProviderError('file is a directory', FileSystemProviderErrorCode.FileIsADirectory);
	}

	protected _lookupParentDirectory(uri: URI): Directory {
		const dirname = this._dirname(uri.path);
		return this._lookupAsDirectory(uri.with({
			path: dirname
		}), false);
	}

	// --- manage file events

	protected _bufferedChanges: IFileChange[] = [];
	protected _fireSoonHandle?: any;

	protected _fireSoon(...changes: IFileChange[]): void {
		this._bufferedChanges.push(...changes);

		if (this._fireSoonHandle) {
			clearTimeout(this._fireSoonHandle);
		}

		this._fireSoonHandle = setTimeout(() => {
			this._bufferedChanges.length = 0;
		}, 5);
	}
	protected _basename(path: string): string {
		path = this._rtrim(path, '/');
		if (!path) {
			return '';
		}

		return path.substr(path.lastIndexOf('/') + 1);
	}

	protected _dirname(path: string): string {
		path = this._rtrim(path, '/');
		if (!path) {
			return '/';
		}

		return path.substr(0, path.lastIndexOf('/'));
	}

	protected _rtrim(haystack: string, needle: string): string {
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