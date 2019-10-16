export default abstract  class BaseLoader {
    public path: string;
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
    constructor(options) {
        this.path = options.path;
    }
}