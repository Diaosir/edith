import File, { FileType } from '@/datahub/project/entities/file';
import ProjectService from '@/datahub/project/service';
import eventBus from '@/utils/event';

export default {
  namespace: 'list',
  state: {
    projectId: 4260,

  },
  effects: {
    * addProject({ payload }, { call, put, select }) {
      const result = yield call(() => ProjectService.addProject(payload));
      console.log(result, '结果');
      // eventBus.emit('saveFileList', fileList);
      // yield put({
      //   type: 'saveFileList',
      //   payload: fileList,
      // });
      return result;
    },
  },
  reducers: {
    triggerFileChilrenOpen(state, { payload }) {
      payload.isOpenChildren = !payload.isOpenChildren;
      return {
        ...state,
      };
    },
  },
};
