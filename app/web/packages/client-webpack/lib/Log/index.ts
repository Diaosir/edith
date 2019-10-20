enum LogType {
    ERROR,
    WARNING,
    INFO,
    SUCCESS
}
export default class Log {
    static logList: Array<{
        type: LogType,
        message: any
    }> = [];
    public static error(message: any) {
        Log.logList.push({
            type: LogType.ERROR,
            message: message
        })
        console.log(message)
    }
}