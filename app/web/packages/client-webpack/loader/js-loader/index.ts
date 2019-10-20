import BaseLoader from '../base-loader'
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
// @ts-ignore
import BabelWorker from 'worker-loader?publicPath=/&name=babel-transpiler.[hash:8].worker.js!./js.worker';

export default class JsLoader extends BaseLoader {
    async translate(code: string): Promise<{
        result: string,
        isError: boolean
    }> {
        return new Promise((resolve) => {
            resolve({
                result: code,
                isError: false
            })
        })
    }
    execute(code: string): Function {
        const _this = this;
        return function(module, exports, __edith_require__) { // eslint-disable-line
            try{
                eval(`${code}\n//# sourceURL=edith:${_this.path}?`)
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