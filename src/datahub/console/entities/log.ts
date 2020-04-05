
export enum LogType {
  ERROR = 'error',
  INFO = 'info',
  WARN = 'warning',
  DEFAULT = 'default'
}
export default class Log {
  public type: LogType;
  public data: any;
  static uid?: number = 0;
  public id: number = 0;
  public filename: string = ''
  constructor(options) {
    this.type = options.type;
    this.data = options.data;
    this.id = Log.uid++;
  }
}