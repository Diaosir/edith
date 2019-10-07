import File from '@/datahub/project/entities/file'
import ClientWebpack from '@/packages/client-webpack';
export default {
    namespace: 'preview',
    state: {
        clientWebpack: new ClientWebpack()
    },
    effects: {
        *onMessage({ payload }, { call, put }) {
            if(payload.type === 'init') {
                yield put({
                    type: 'init',
                    payload: File.generateFileList(payload.payload)
                })
            }
        }
    },
    reducers: {
        init(state, { payload }) {
            return {
                ...state,
                fileList: payload,
                clientWebpack: new ClientWebpack({
                    template: 'create-react-app',
                    fileList: payload,
                    document: ''
                })
            }
        }
    }
}