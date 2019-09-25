import path from 'path'
console.log(path)
export enum FileStatus {
  ERROR,
  HAS_CHANGE_NO_SAVE,
}
export enum FileType {
  JS = "js",
  CSS = 'css',
  SCSS = 'scss',
  LESS = 'less',
  TS = 'ts',
  JSX = 'jsx',
  TSX = 'tsx',
  JSON = 'json',
  FOLDER = 'folder',
  HTML = 'html',
  DEFAULT = 'default'
}
const FILE_COLOR = {
  [FileType.JS]: {
    borderLeftColor: {
      red: 255,
      green: 211,
      blue: 153,
      alpha: 1
    },
    background: {
      red: 255,
      green: 228,
      blue: 194,
      alpha: 0.2
    }
  },
  [FileType.CSS]: {
    borderLeftColor: {
      red: 97,
      green: 218,
      blue: 251,
      alpha: 1
    },
    background: {
      red: 131,
      green: 226,
      blue: 252,
      alpha: 0.2
    }
  },
  [FileType.FOLDER]: {
    borderLeftColor: {
      red: 97,
      green: 218,
      blue: 252,
      alpha: 1
    },
    background: {
      red: 131,
      green: 226,
      blue: 252,
      alpha: 0.2
    }
  },
  default: {
    borderLeftColor: {
      red: 97,
      green: 218,
      blue: 251,
      alpha: 1
    },
    background: {
      red: 131,
      green: 226,
      blue: 252,
      alpha: 0.2
    }
  }
}
export interface IFile {
  name: string;
  type?: FileType;
  createDate?: Date;
  modifyDate?: Date;
  owner?: string;
  value?: string;
  projectId?: number;
  isLock?: boolean;
  path?: string;
  children?: Array<File>;
  isOpenChildren?: boolean;
  active?: Boolean;
  fid?: number;
  isEdit?: boolean;
  [key: string]: any;
}
export class File {
  public name: string;
  public type?: FileType;
  public createDate?: Date;
  public modifyDate?: Date;
  public owner?: string;
  public value?: string;
  public projectId?: number;
  public isLock?: boolean;
  public children: Array<File> = [];
  public isOpenChildren: Boolean = false;
  public active: Boolean = false;
  public fid?: number = 0;
  static uid?: number = 0;
  public isEdit: boolean = false;
  public isDelete: boolean = false;
  constructor(options?: IFile) {
    this.name = options.name;
    this.type = options.type;
    this.value = options.value;
    this.children = options.children || [];
    this.isOpenChildren = options.isOpenChildren;
    this.active = options.active;
    this.fid = options.fid || options.id || File.uid++;
    this.isEdit = options.isEdit;
    this.isDelete = options.isDelete;
  }
  public getIconName(): string {
    switch(this.type) {
      case FileType.JSON:
        return 'json';
      case FileType.HTML:
        return 'html';
      case FileType.TS:
      case FileType.TSX:
        return 'typescript';
      case FileType.JS:
      case FileType.JSX:
        return 'javascript'
      case FileType.CSS:
        return 'css';
      case FileType.SCSS:
        return 'sass'
      case FileType.LESS:
        return 'less'
      case FileType.FOLDER:
        return 'folder'
      default:
        return 'file'
    }
  }
  public getOpenIconName(): string {
    switch(this.type) {
      case FileType.FOLDER:
        return 'folder-open'
      default:
        return 'file'
    }
  }
  public getDefaultHoverBackground() {
    return {
      red: 131,
      green: 226,
      blue: 252,
      alpha: 0.1
    }
  }
  public getColorObject(): any{
    return FILE_COLOR[this.type] || FILE_COLOR.default;
  }
  static filenameToFileType(filename: string): FileType {
    const extname = path.extname(filename).replace(/\./g, '').toLocaleUpperCase();
    return FileType[extname] || FileType.DEFAULT
  }
}