import { File, FileType } from '../../../../interface/File'
const fileList = [
  new File(
    {
      type: FileType.FOLDER,
      name: 'public',
      isLock: false,
      isOpenChildren: true,
      children: [
        new File({
          type: FileType.FOLDER,
          name: 'components',
          isLock: false,
          isOpenChildren: true,
          children: [
            new File({
              type: FileType.TS,
              name: 'index.ts',
              isLock: false
            })
          ]
        }),
        new File({
          type: FileType.JS,
          name: 'index.js',
          isLock: false,
        }),
        new File({
          type: FileType.CSS,
          name: 'index.css',
          isLock: false
        })
      ]
    }
  ),
  new File({
    type: FileType.FOLDER,
    name: 'src',
    isLock: false,
    children:[
      new File({
        type: FileType.LESS,
        name: 'index.less',
        isLock: false
      })
    ]
  }),
  new File({
    type: FileType.SCSS,
    name: 'index.scss',
    isLock: false
  }),
  new File({
    type: FileType.HTML,
    name: 'index.html',
    isLock: false
  }),
  new File({
    type: FileType.JSON,
    name: 'package.json',
    isLock: false
  })
]
function recursion(fid: number, fileList: Array<File>, matchCallback?:Function, noMatchCallBack?: Function){
  if(fileList.length > 0) {
    fileList.forEach(item => {
      if(item.fid === fid) {
        typeof matchCallback === 'function' && matchCallback(item);
      } else {
        typeof noMatchCallBack === 'function' && noMatchCallBack(item);
      }
      if (item.children.length > 0) {
        recursion(fid, item.children, matchCallback, noMatchCallBack);
      }
    })
  }
}
export default {
  namespace: 'home',
  state: {
    vscode: {
      fileList: fileList
    }
  },
  effects: {
    *menuFileClickEvent({payload}, { put }) {
      const file: File = payload;
      if (file.type === FileType.FOLDER) {
        yield put({
          type: 'triggerFileChilrenOpen',
          payload: file
        })
      } else {
        yield put({
          type: 'setFileActive',
          payload: file
        })
      }
    }
  },
  reducers: {
    triggerFileChilrenOpen(state, { payload }) {
      payload.isOpenChildren = !payload.isOpenChildren;
      return {
        ...state
      }
    },
    addFolder(state, { payload }) {
      const file: File = payload;
      recursion(file.fid, state.vscode.fileList, function(matchFile: File) {
        matchFile.isOpenChildren = true;
      })
      file.children.push(
        new File({
          name: '',
          type: FileType.FOLDER,
          isEdit: true
        })
      )
      return {
        ...state
      }
    },
    deleteFile(state, { payload }) {
      const { vscode: {fileList }} = state;
      const file: File = payload;
      recursion(file.fid, fileList, function(matchFile: File) {
        matchFile.isDelete = true;
      })
      return {
        ...state
      }
    },
    editFile(state, { payload }) {
      const { vscode: { fileList }} = state;
      recursion(payload.fid, fileList, function(file: File) {
        file.isEdit = true;
        file.active = true;
      });
      return {
        ...state
      }
    },
    addFile(state, { payload }) {
      const file: File = payload;
      recursion(file.fid, state.vscode.fileList, function(matchFile: File) {
        matchFile.isOpenChildren = true;
      })
      file.children.push(
        new File({
          name: '',
          type: FileType.DEFAULT,
          isEdit: true,
          active: true
        })
      )
      return {
        ...state
      }
    },
    renameFile(state, { payload}) {
      const { vscode: { fileList } } = state;
      recursion(payload.fid, fileList, (file: File) => {
        file.name = payload.name;
        file.isEdit = false;
        if (file.type !== FileType.FOLDER ){
          file.type = File.filenameToFileType(payload.name);
        }
      })
      return {
        ...state
      }
    },
    setFileActive(state, { payload }) {
      const { vscode: {fileList} } = state;
      const file: File = payload;
      function recursion(filelist: Array<File>,) {
        if(filelist.length > 0) {
          filelist.forEach(item => {
            if(item.fid === file.fid) {
              item.active = true;
            } else {
              item.active = false;
            }
            if (item.children.length > 0) {
              recursion(item.children);
            }
          })
        }
        return filelist;
      }
      recursion(fileList);
      return {
        ...state,
        fileList
      };
    }
  }
}