import File, { FileType } from '@/datahub/project/entities/file'
import ProjectService from '@/datahub/project/service';
import eventBus from '@/utils/event'

// const fileList = [
//   new File(
//     {
//       type: FileType.FOLDER,
//       name: 'public',
//       isLock: false,
//       isOpenChildren: true,
//       children: [
//         new File({
//           type: FileType.FOLDER,
//           name: 'components',
//           isLock: false,
//           isOpenChildren: true,
//           children: [
//             new File({
//               type: FileType.TS,
//               name: 'index.ts',
//               isLock: false
//             })
//           ]
//         }),
//         new File({
//           type: FileType.JS,
//           name: 'index.js',
//           isLock: false,
//         }),
//         new File({
//           type: FileType.CSS,
//           name: 'index.css',
//           isLock: false
//         })
//       ]
//     }
//   ),
//   new File({
//     type: FileType.FOLDER,
//     name: 'src',
//     isLock: false,
//     children:[
//       new File({
//         type: FileType.LESS,
//         name: 'index.less',
//         isLock: false
//       })
//     ]
//   }),
//   new File({
//     type: FileType.SCSS,
//     name: 'index.scss',
//     isLock: false
//   }),
//   new File({
//     type: FileType.HTML,
//     name: 'index.html',
//     isLock: false
//   }),
//   new File({
//     type: FileType.JSON,
//     name: 'package.json',
//     isLock: false
//   })
// ]
function fileIsExit(fid: number, fileList: Array<File>) {
  const target = fileList.filter(file => file.fid === fid);
  return target.length > 0
}
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
    projectId: 4260,
    vscode: {
      fileList: [],
      editFileList: [],
      activeFileId: -1
    }
  },
  effects: {
    *menuFileClickEvent({payload}, { put, call, select }) {
      const file: File = payload;
      const { projectId } = yield select(({home}) => home);
      if (file.type === FileType.FOLDER) {
        // if (!file.isOpenChildren && file.children.length === 0) {
        //   const childrenFileList = yield call(() => ProjectService.getProjectFileList(projectId, file.path));
        //   file.children = childrenFileList
        // }
        yield put({
          type: 'triggerFileChilrenOpen',
          payload: file
        })
      } else {
        // if (!file.getValue()) {
        //   const fileContent = yield call(() => ProjectService.getProjectFileContent(projectId, file.path));
        //   file.setVaule(fileContent, true);
        // }
        yield put({
          type: 'setFileActive',
          payload: file
        })
      }
    },
    *handleMonacoEditorChange({ payload }, { call, put, select }) {
      const file: File = payload.file;
      file.setVaule(payload.value, false);
      const { vscode: { fileList } } = yield select(state => state.home);
      eventBus.emit('changeFileList', fileList, file);
      yield put({
        type: 'editorSaveFileContent',
        payload: payload
      })
    },
    *getProjectFileList( { payload }, { call, put, select }) {
      const { projectId } = yield select(({home}) => home);
      const fileList = yield call(() => ProjectService.getProjectFileList(projectId, payload.name));
      // eventBus.emit('saveFileList', fileList);
      yield put({
        type: 'saveFileList',
        payload: fileList
      })
      return fileList
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
      const { vscode: { fileList }} = state
      const fid = payload.fid;
      let file = null;
      recursion(fid, state.vscode.fileList, function(matchFile: File) {
        file = matchFile;
        matchFile.isOpenChildren = true;
      })
      const newFile = new File({
        name: '',
        type: FileType.FOLDER,
        isEdit: true
      })
      if (!!file) {
        file.children.push(newFile)
      } else {
        fileList.push(newFile)
      }
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
      let { vscode: {fileList, editFileList } } = state;
      const file: File = payload;
      return {
        ...state,
        vscode: {
          fileList,
          editFileList: fileIsExit(file.fid, editFileList) ? editFileList : [].concat(editFileList, [file]),
          activeFileId: file.fid
        }
      };
    },
    saveFileList(state, { payload } ){
      return {
        ...state,
        vscode: {
          ...state.vscode,
          fileList: payload
        }
      }
    },
    editorSaveFileContent(state, { payload }) {
      return {
        ...state
      }
    },
    editorRemoveItem(state, { payload }) {
      let { vscode: { editFileList } } = state;
      const file: File = payload;
      const newEditFileList = editFileList.filter((item: File) => { return item.fid !== file.fid})
      return {
        ...state,
        vscode: {
          ...state.vscode,
          editFileList: newEditFileList,
          activeFileId: newEditFileList.length > 0 ? newEditFileList[newEditFileList.length - 1].fid : ''
        }
      }
    }
  }
}