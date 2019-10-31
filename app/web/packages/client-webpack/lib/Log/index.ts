enum LogType {
    ERROR,
    WARNING,
    INFO,
    SUCCESS
}
export default class Log {
    public logList: Array<{
        type: LogType,
        message: any
    }> = [];
    public error(message: any) {
        this.logList.push({
            type: LogType.ERROR,
            message: message
        })
        console.log(message)
    }
}