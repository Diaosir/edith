/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FileSystemProviderCapabilities, IStat, FileType, FileDeleteOptions, FileOverwriteOptions, FileWriteOptions, FileSystemProviderError, FileSystemProviderErrorCode, IFileSystemProviderWithFileReadWriteCapability, NotImplementedError } from './file';
import { URI } from '../../lib/Uri' 
const textEncoder = new TextEncoder();

export class FetchFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {

	readonly capabilities = FileSystemProviderCapabilities.Readonly + FileSystemProviderCapabilities.FileReadWrite + FileSystemProviderCapabilities.PathCaseSensitive;
	// working implementations
	async readFile(resource: URI): Promise<Uint8Array> {
		try {
			const res = await fetch(resource.toString(true));
			if (res.status === 200) {
				return new Uint8Array(await res.arrayBuffer());
			}
			throw new FileSystemProviderError(res.statusText, FileSystemProviderErrorCode.Unknown);
		} catch (err) {
			throw new FileSystemProviderError(err, FileSystemProviderErrorCode.Unknown);
		}
	}

	// fake implementations
	async stat(_resource: URI): Promise<IStat> {
		return {
			type: FileType.File,
			size: 0,
			mtime: 0,
			ctime: 0
		};
	}

	watch() {
		return null;
	}

	// error implementations
	writeFile(_resource: URI, _content: Uint8Array, _opts: FileWriteOptions): Promise<void> {
		throw new NotImplementedError();
	}
	readdir(_resource: URI): Promise<[string, FileType][]> {
		throw new NotImplementedError();
	}
	mkdir(_resource: URI): Promise<void> {
		throw new NotImplementedError();
	}
	delete(_resource: URI, _opts: FileDeleteOptions): Promise<void> {
		throw new NotImplementedError();
	}
	rename(_from: URI, _to: URI, _opts: FileOverwriteOptions): Promise<void> {
		throw new NotImplementedError();
	}
}