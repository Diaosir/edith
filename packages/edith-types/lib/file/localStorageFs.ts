
import {File, Directory, FileChangeType, FileType, IStat, FileSystemProviderErrorCode, FileSystemProviderError, FileWriteOptions, IFileChange, FileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability } from './file';
import { URI } from 'edith-types/lib/uri'
import Memfs from './memfs'
const { TextEncoder } = require('@exodus/text-encoding-utf8')
const textEncoder: any = new TextEncoder();

export type Entry = File | Directory;

export default class LocalStorageFileSystemProvider extends Memfs implements IFileSystemProviderWithFileReadWriteCapability {
	public fileCache: Map<string, string> = new Map();
	private _isInit: boolean = false;
  root = new Directory('file');
  public scheme: string = 'file';
  // --- manage file metadata
  constructor(scheme) {
		super();
    if (scheme) {
      this.scheme = scheme;
      this.root = new Directory(scheme);
		}
		this.init()
  }
	// --- manage file contents
	async init() {
		if(this._isInit) {
			return;
		}
		const localStorageKeys = Object.keys(window.localStorage);
		const reg = new RegExp(`^${this.scheme}:`)
		await Promise.all(localStorageKeys.filter(item => item.match(reg)).map(async item => {
			const content = window.localStorage.getItem(item);
			await this.writeFileAnyway(URI.parse(item), content);
		}))
		this._isInit = true;
	}
	async readFile(resource: URI): Promise<Uint8Array> {
		await this.init()
    this._lookupAsFile(resource, false);
    const data = localStorage.getItem(resource.toString());
		if (data) {
			return textEncoder.encode(data);
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
    if (!this._isInThisProvider(resource)) {
      throw new FileSystemProviderError(`file is can not write in ${this.scheme}`, FileSystemProviderErrorCode.FileExists);
    }
		if (!entry) {
			entry = new File(basename);
			parent.entries.set(basename, entry);
			this._fireSoon({ type: FileChangeType.ADDED, resource });
		}
		entry.mtime = Date.now();
		entry.size = content.byteLength;
    localStorage.setItem(resource.toString(), content.toString());
		this._fireSoon({ type: FileChangeType.UPDATED, resource });
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

	async delete(resource: URI): Promise<void> {
		let dirname = resource.with({
			path: this._dirname(resource.path)
		});
		let basename = this._basename(resource.path);
    let parent = this._lookupAsDirectory(dirname, false);
    let entry = this._lookup(resource, false);
		if (!parent.entries.has(basename)) {
			throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
    }
    parent.entries.delete(basename);

    if(entry instanceof File) {
      localStorage.removeItem(resource.toString());
    }
		parent.mtime = Date.now();
		parent.size -= 1;
		this._fireSoon({ type: FileChangeType.UPDATED, resource: dirname }, { resource, type: FileChangeType.DELETED });
	}

	// async mkdir(resource: URI): Promise<void> {
	// 	let basename = this._basename(resource.path);
	// 	let dirname = resource.with({
	// 		path: this._dirname(resource.path)
	// 	});
	// 	let parent = this._lookupAsDirectory(dirname, false);

	// 	let entry = new Directory(basename);
	// 	parent.entries.set(entry.name, entry);
	// 	parent.mtime = Date.now();
	// 	parent.size += 1;
	// 	this._fireSoon({ type: FileChangeType.UPDATED, resource: dirname }, { type: FileChangeType.ADDED, resource });
	// }
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
  protected _isInThisProvider(resource: URI) {
    const scheme = resource.scheme;
    return scheme === this.scheme
  }
}