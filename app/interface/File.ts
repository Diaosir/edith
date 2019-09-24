
enum FileType {
  JS,
  CSS,
  SCSS,
  TS,
  JSX,
  TSX,
  JSON,
  FOLDER
}
export interface IFile {
  name: string;
  type: FileType;
  createDate?: Date;
  modifyDate?: Date;
  owner?: string;
  value?: string;
  projectId?: number;
  isLock: boolean;
}

export class File {
  public name: string;
  public type: FileType;
  public createDate?: Date;
  public modifyDate?: Date;
  public owner?: string;
  public value?: string;
  public projectId?: number;
  public isLock: boolean;
  constructor(options?: IFile) {
    this.name = options.name;
    this.type = options.type;
    this.value = options.value;
  }
  public getIconName(): string {
    return 'folder'
  }
}