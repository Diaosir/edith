import path from 'path'
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
  MD = 'md',
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
export default class File {
  public name: string;
  public type?: FileType;
  public createDate?: Date;
  public modifyDate?: Date;
  public owner?: string;
  protected value?: string;
  protected originalValue?: string;
  public projectId?: number;
  public isLock?: boolean;
  public children: Array<File> = [];
  public isOpenChildren: Boolean = false;
  public active: Boolean = false;
  public fid?: number = 0;
  static uid?: number = 0;
  public isEdit: boolean = false;
  public isDelete: boolean = false;
  public path: string = ''
  constructor(options?: IFile) {
    this.name = options.name;
    this.type = File.filenameToFileType(options.name);
    this.value = options.value;
    this.originalValue = options.value;
    this.children = options.children || [];
    this.isOpenChildren = options.isOpenChildren;
    this.active = options.active;
    this.fid = options.fid || File.uid++;
    this.isEdit = options.isEdit;
    this.isDelete = options.isDelete;
    this.path = options.path;
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
      case FileType.HTML: 
        return 'html';
      case FileType.FOLDER:
        return 'folder'
      case FileType.MD:
        return 'markdown'
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
  static filenameToFileType(filename: string = ''): FileType {
    const extname = path.extname(filename).replace(/\./g, '').toLocaleUpperCase();
    if (filename.indexOf('.') == -1) {
      return FileType.FOLDER
    }
    return FileType[extname] || FileType.DEFAULT
  }
  public isDirty(): Boolean {
    return this.value !== this.originalValue;
  }
  public getValue() {
    return this.value;
  }
  public setVaule(value:any, isSetOriginalValue) {
    this.value = value;
    isSetOriginalValue && (this.originalValue = value);
  }
  static generateFileList(data: Array<any>): Array<File> {
    let fileList: Array<File> = data.map(fileData => {
      let file = new File(fileData);
      if (file.children.length > 0) {
        file.children = File.generateFileList(fileData.children);
      }
      return file;
    });
    return fileList;
  }
  static recursion(fileList: Array<File>, callback: Function){
    if(fileList.length > 0) {
      fileList.forEach(item => {
        callback(item)
        if (item.children.length > 0) {
          File.recursion(item.children, callback);
        }
      })
    }
  }
  static isStyle(type: FileType) {
    return [FileType.CSS, FileType.SCSS, FileType.LESS].includes(type)
  }
}