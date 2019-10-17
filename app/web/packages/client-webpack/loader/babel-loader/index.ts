import BaseLoader from '../base-loader'
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import Worker from 'worker-loader!./translate.worker';
import Worker2 from 'worker-loader!./translate.worker2';
export default class BabelLoader extends BaseLoader {
    static workerNumber = 1;
    static translateWorkers: Map<string, {
        worker: any,
        isBusy: boolean
    }> = new Map();
    static translateQuenes: Array<{
        code: string,
        path: string,
        childrenDenpenciesMap: any
    }> = [];
    constructor(options) {
        super(options);
    }
    static onWorkerMessage(callback) {
        BabelLoader.translateWorkers.forEach(({ worker }, name) => {
            worker.addEventListener('message', callback)
        })
    }
    static setWorkerBusy(workerName: string) {
        const workerValue = BabelLoader.translateWorkers.get(workerName);
        workerValue.isBusy = true;
    }
    static setWorkerFree(workerName: string) {
        const workerValue = BabelLoader.translateWorkers.get(workerName);
        workerValue.isBusy = false;
    }
    static getFreeWorker() {
        let freeWorker = null, freeWorkerName = ''
        BabelLoader.translateWorkers.forEach((workerValue, name) => {
            if (!workerValue.isBusy) {
                freeWorker = workerValue.worker;
                freeWorkerName = name;
            }
        })
        return {
            worker: freeWorker,
            name: freeWorkerName
        }
    }

    static postDataToWoker(workerName: string) {
        const { worker, isBusy } = BabelLoader.translateWorkers.get(workerName);
        if(!isBusy) {
            const popData = BabelLoader.translateQuenes.pop();
            popData && worker.postMessage({
                type: 'babel-translate',
                payload: popData
            })
            BabelLoader.setWorkerBusy(workerName);
        }
    }
    async translateByWorker(code: string, childrenDenpenciesMap: Map<string, string> = new Map()): Promise<{
        result: string,
        isError: boolean
    }> {

        BabelLoader.translateQuenes.push({
            code,
            path: this.path,
            childrenDenpenciesMap
        });
        const { worker, name } = BabelLoader.getFreeWorker();
        if (!!worker) {
            BabelLoader.postDataToWoker(name);
        }
        return new Promise((resolve, reject) => {
            BabelLoader.onWorkerMessage((ev: MessageEvent) => {
                const { data } = ev;
                if (data && data.type === `translate-${this.path}-result`) {
                    const { result, isError} = data.payload;
                    resolve({
                        result,
                        isError
                    });
                }
            });
        });
    }
    async translate(code: string, childrenDenpenciesMap: Map<string, string> = new Map()): Promise<{
        result: string,
        isError: boolean
    }> {
        // try{
        //     const transformResult = babel.transform(code, {
        //         presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
        //         plugins: [[ReplaceRequire, {path: this.path}]]
        //     });
        //     return {
        //         result: transformResult.code,
        //         isError: false
        //     }
            
        // } catch(error) {
        //     //Todo log
        //     console.log(error)
        //     return {
        //         result: error,
        //         isError: true
        //     }
        // }
        return this.translateByWorker(code, childrenDenpenciesMap);
    }
    execute(code: string): Function {
        const _this = this;
        return function(module, exports, __edith_require__) {
            try{
                eval(`${code}\n//# sourceURL=edith:${_this.path}?`)
            } catch(error){
                // Todo log execute error
                console.log(error)
            }
            
        }
    }
    getDependencies(code: string): Array<string> {
        let ast = null;
        try{
            ast = parse(code, {
                sourceType: "module",
                plugins: [
                // enable jsx and flow syntax
                "jsx",
                "flow"
                ]
            });
        } catch(error) {
            return []
        }
        let packages: Set<string> = new Set()
        traverse(ast, {
        ImportDeclaration: function(nodePath) {
            // console.log(nodePath)
            const { node: { source } } = nodePath;
            if ( source.type === 'StringLiteral' && !!source.value) {
            packages.add(source.value);
            }
        },
        CallExpression: function(nodePath) {
            const { node: { callee, arguments: args }} = nodePath;
            if (callee.type === "Identifier" && callee.name === 'require' && args.length > 0) {
                const arg: any = args[0];
                packages.add(arg.value)
            }
        }
        })
        return Array.from(packages);
    }
}
BabelLoader.translateWorkers.set('babel-worker-1', {
    worker: new Worker(),
    isBusy: false
});
BabelLoader.translateWorkers.set('babel-worker-2', {
    worker: new Worker2(),
    isBusy: false
});
BabelLoader.onWorkerMessage((ev: MessageEvent) => {
    const { data } = ev;
    if (data && data.type === 'IAMFREE') {
        BabelLoader.setWorkerFree(data.name);
        BabelLoader.postDataToWoker(data.name);
    }
});