import BaseLoader from '../base-loader'
import * as babel from '@babel/standalone';
import * as BabelTypes from '@babel/types';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import path from 'path'
import Worker from 'worker-loader!./translate.worker.js';
import ReplaceRequire from './plugins/replace-require'
const translateWorker = new Worker();
export default class BabelLoader extends BaseLoader {
    constructor(options) {
        super({
            ...options,
            worker: Worker
        })
    }
    async translateByWorker(code: string, childrenDenpenciesMap: Map<string, string> = new Map()): Promise<{
        result: string,
        isError: boolean
    }> {
        translateWorker.postMessage({
            type: 'babel-translate',
            payload: {
                code,
                path: this.path,
                childrenDenpenciesMap
            }
        })
        return new Promise((resolve, reject) => {
            translateWorker.onmessage = (ev: MessageEvent) => {
                const { data } = ev;
                if (data && data.type === `translate-${this.path}-result`) {
                    const { result, isError} = data.payload;
                    resolve({
                        result,
                        isError
                    });
                }
            };
        });
    }
    async translate(code: string, childrenDenpenciesMap: Map<string, string> = new Map()): Promise<{
        result: string,
        isError: boolean
    }> {
        // try{
        //     const transformResult = babel.transform(code, {
        //         presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
        //         plugins: [[ReplaceRequire, {path: this.path}]]
        //     });
        //     return {
        //         result: transformResult.code,
        //         isError: false
        //     }
            
        // } catch(error) {
        //     //Todo log
        //     console.log(error)
        //     return {
        //         result: error,
        //         isError: true
        //     }
        // }
        return this.translateByWorker(code, childrenDenpenciesMap);
    }
    execute(code: string): Function {
        const _this = this;
        return function(module, exports, __edith_require__) {
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