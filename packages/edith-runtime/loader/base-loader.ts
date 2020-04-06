import * as is from 'is'
interface ITask {
    data: any;
    options?: any;
    callbacks: Array<(error, result) => void>;
}
export default abstract  class BaseLoader {
    public path: string;
    Worker: () => Worker = null;
    workers: Array<Worker> = [];
    freeWorkers: Array<Worker> = [];
    loadingWorkers: number = 0;
    workerCount: number = 3;
    taskQueue: {
        [path: string]: ITask;
    } = {};
    initialized: boolean;
    runningTasks: {
        [id: string]: (error: Error, message: Object) => void;
    };
    constructor(options: any = {}) {
        this.path = options.path;
        this.Worker = options.worker;
        if (this.Worker) {
            this.initWorker();
        }
    }
    abstract async beforeTranslate(data: any): Promise<any>;
    abstract async afterTranslate(data: any): Promise<any>;
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
    abstract async translate(data: { [key: string]: any}): Promise<any>;
    getWorker(): Promise<Worker> {
        // @ts-ignore
        return Promise.resolve(new this.Worker());
    }
    async initWorker() {
        // if (this.workers.length === 0) {
        //     await Promise.all(
        //         Array.from({ length: this.workerCount }, () => this.loadWorker())
        //     );
        // }
        await this.loadWorker()
        this.initialized = true;
    }
    async loadWorker() {
        if (this.loadingWorkers >= this.workerCount) {
            return;
        }
        const worker = await this.getWorker();
        this.loadingWorkers++;
        this.workers.push(worker);
        this.freeWorkers.push(worker);
        this.translateRemainingTasks();
    }
    executeTask({ data, callbacks }, worker: Worker) {
        worker.onmessage = async (message: MessageEvent) => {
            const { data: result } = message;
            if(!is.object(result)) {
                // callbacks.forEach(callback => callback(result));
                return ;
            }
            if (result.type === 'success') {
                callbacks.forEach(callback => callback(result.error, result.payload));
            }
            if(result.type === 'error') {
                callbacks.forEach(callback => callback(result.error));
            }
            if (result.type === 'error' || result.type === 'success') {
                this.freeWorkers.unshift(worker);
                this.translateRemainingTasks();
            }
        }
        worker.postMessage({ type: 'babel-translate', payload: data });
    }
    async pushTaskToQueue(path: string, data: any, callback) {
        if (this.freeWorkers.length === 0 && this.loadingWorkers < this.workerCount) {
            await this.loadWorker();
        }
        if(!this.taskQueue[path]) {
            this.taskQueue[path] = {
                data,
                callbacks: []
            }
        }
        this.taskQueue[path].callbacks.push(callback);
        this.translateRemainingTasks();
    }
    translateRemainingTasks() {
        const taskIds = Object.keys(this.taskQueue)
        while (this.freeWorkers.length > 0 && taskIds.length > 0) {
          const taskId = taskIds.shift();
          const task = this.taskQueue[taskId];
          delete this.taskQueue[taskId];
          const worker = this.freeWorkers.shift();
          this.executeTask(task, worker);
        }
    }
}