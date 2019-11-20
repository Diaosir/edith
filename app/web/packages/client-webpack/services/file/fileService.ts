import { IFileSystemProvider } from './file'
export interface IFileService {
  registerProvider(scheme: string, provider: IFileSystemProvider): any;
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
}