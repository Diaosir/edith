
export default abstract  class BaseLoader {
    public path: string;
    Worker: () => Worker = null;
    workers: Array<Worker> = [];
    freeWorkers: Array<Worker> = [];
    loadingWorkers: number = 0;
    workerCount: number = 2;
    taskQueue: {
        [path: string]: any;
    };
    initialized: boolean;
    runningTasks: {
        [id: string]: (error: Error, message: Object) => void;
    };
    constructor(options) {
        this.path = options.path;
        this.Worker = options.worker;
        if (this.Worker) {
            this.initWorker();
        }
    }
    /**
     *
     * 将代码转译
     * @abstract
     * @param {string} code
     * @returns {Promise<{
        *         result: string;
        *         isError: boolean;
        *     }>}
        * @memberof BaseLoader
        */
    abstract async translate(code: string, childrenDenpenciesMap?: Map<string, string>): Promise<{
        result: string;
        isError: boolean;
    }>;
    /**
        *
        * 执行转译后的代码
        * @abstract
        * @param {string} code
        * @returns {Function}
        * @memberof BaseLoader
        */
    abstract execute(code: string): Function;
    abstract getDependencies(code: string): Array<string>;
    getWorker(): Promise<Worker> {
        // @ts-ignore
        return Promise.resolve(new this.Worker());
    }
    async initWorker() {
        for( let i = 0; i < this.workerCount; i++) {
            const worker = await this.getWorker();
            this.workers.push(worker);
            this.freeWorkers.push(worker);
        }
    }
    executeTask({ message, loaderContext, callbacks }, worker: Worker) {
        worker.onmessage = async (message: MessageEvent) => {
            const { data } = message;

        }
        worker.postMessage({ type: 'babel-translate', ...message });
    }
    async pushTaskToQueue(path, code, options, callback) {

    }
    translateRemainingTasks() {

    }
}