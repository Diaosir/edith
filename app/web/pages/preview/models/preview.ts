import File from '@/datahub/project/entities/file'
import ClientWebpack from '@/packages/client-webpack';
import Jest from '@/packages/jest'
const clientWebpack = new ClientWebpack();
export default {
    namespace: 'preview',
    state: {
    },
    effects: {
        *onMessage({ payload }, { call, put }) {
            if(payload.type === 'init') {
                const fileList = File.generateFileList(payload.payload);
                clientWebpack.init({
                    template: 'create-react-app',
                    fileList: fileList,
                    document: ''
                })
                clientWebpack.registerPlugin(new Jest({
                    onResult: (error, result) => {
                        window.parent.postMessage({
                            type: 'jest-result',
                            payload: {
                                result,
                                error,
                            }
                        }, '*')
                    }
                }));
            }
            if (payload.type === 'changeFileList') {
                const { fileList, file } = payload.payload;
                clientWebpack.changeFile(new File(file));
            }
        }
    },
    reducers: {
    }
}