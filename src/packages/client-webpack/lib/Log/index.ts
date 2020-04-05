enum LogType {
    ERROR,
    WARNING,
    INFO,
    SUCCESS
}
export default class Log {
    public logList: Array<{
        type: LogType,
        data: any
    }> = [];
    public error(data: any) {
        this.logList.push({
            type: LogType.ERROR,
            data: data
        })
    }
}