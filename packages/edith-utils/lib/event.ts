const is = require('is')
class MyEventEmitter {
    protected eventNames:  {
        [key: string]: Array<any>
    } = {};
    protected emitCaches: {
        [key: string]: Array<any> | undefined;
    } = {}
    public on(eventName: string, callback: Function) {
        if(!!this.emitCaches[eventName]) {
            callback.apply(null, this.emitCaches[eventName]);
            this.emitCaches[eventName] = undefined;
        }
        //只支持监听一个回调函数
        this.eventNames[eventName] = [callback];
        // if (this.eventNames[eventName] === undefined) {
        //     this.eventNames[eventName] = [callback];
        // } else if(is.array(this.eventNames[eventName])){
        //     this.eventNames[eventName].push(callback);
        // }
    }
    public emit(eventName: string, ...args: any) {
        if(is.array(this.eventNames[eventName]) && this.eventNames[eventName].length > 0) {
            this.eventNames[eventName].forEach((callback: Function) => {
                callback.apply(null, args);
            })
        } else {
            this.emitCaches[eventName] = args;
        }
    }
}
export default new MyEventEmitter();