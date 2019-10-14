import BaseLoader from '../base-loader'
import * as babel from '@babel/standalone';
import * as BabelTypes from '@babel/types';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import path from 'path'

import Transpiler from '@/packages/client-webpack/lib/transpiler/transpiler';
const plugins = function({types: BabelTypes}, options) {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                // console.log(path)
            },
            CallExpression(path, state) {
                const { node: { callee, arguments: args }} = path;
                if (callee.type === "Identifier" && callee.name === 'require') {
                    path.node.callee = BabelTypes.identifier("__edith_require__");
                    if (args.length === 1) {
                        const arg: any = args[0];
                        path.node.arguments = [BabelTypes.stringLiteral(Transpiler.getDenpenciesIdMapValue(options.path, arg.value))]
                    }
                }
                // if (callee.type === "Identifier" && callee.name === 'require' && args.length > 0) {
                //     const arg: any = args[0];
                //     // console.log(path)
                // }
            }
        }
      };
}
export default class BabelLoader extends BaseLoader {
    constructor(options) {
        super(options)
    }
    async translate(code: string): Promise<{
        result: string,
        isError: boolean
    }> {
        try{
            const transformResult = babel.transform(code, {
                presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
                plugins: [[plugins, {path: this.path}]]
            });
            return {
                result: transformResult.code,
                isError: false
            }
            
        } catch(error) {
            //Todo log
            console.log(error)
            return {
                result: error,
                isError: true
            }
        }
        
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