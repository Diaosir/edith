import BaseLoader from '../base-loader'
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import Worker from 'worker-loader!./translate.worker.js';
export class BabelLoader extends BaseLoader {
    constructor(options) {
        super({
            ...options,
            worker: Worker
        })
    }
    /**
     * nothing
     *
     * @memberof BabelLoader
     */
    quit(modulePath) {

    }
    async beforeTranslate() {
        return ''
    }
    async afterTranslate({path, denpencies, context }) {
        await Promise.all(denpencies.map( async(denpency) => {
            return context.traverseChildren(path, denpency);
        }));
    }
    async translate({code, path, context }): Promise<{
        result: string,
        isError: boolean,
        denpencies: any
    }> {
        const data:any = await new Promise((resolve, reject) => {
            this.pushTaskToQueue(path, {
                code: code,
                path: path,
                chilrenMaps: context.getChildrenDenpenciesIdMapValue(path)
            },  (error, result) => {
                if (error) {
                    reject({
                        isError: true,
                        result: error
                    })
                } else {
                    resolve({
                        isError: false,
                        result: result.code,
                        denpencies: result.denpencies
                    });
                    
                }
            });
        });
        if (data.denpencies) {
            await this.afterTranslate({path, denpencies: data.denpencies, context});
        }
        return data;
    }
    execute({ code, path, context }): Function {
        return function(module, exports, __edith_require__) {
            try{
                eval(`${code}\n//# sourceURL=edith:${path}?`)
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
export default new BabelLoader({});