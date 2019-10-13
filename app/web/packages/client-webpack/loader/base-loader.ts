export default abstract  class BaseLoader {
    public path: string;
    abstract translate(code: string): {
        result: string;
        isError: boolean;
    };
    abstract execute(code: string): Function;
    abstract getDependencies(code: string): Array<string>;
    constructor(options) {
        this.path = options.path;
    }
}