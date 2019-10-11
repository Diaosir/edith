import File, { FileType } from '@/datahub/project/entities/file';
import * as babel from '@babel/standalone';
import Ast from '../ast';
import md5 from '@/utils/md5'
import * as BabelTypes from '@babel/types';
import Transpiler from './transpiler';
// import typescriptPreset from '@babel/preset-typescript'
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
export default class TranspilerModule {
    path: string;
    type: FileType;
    code: string;
    transpiledCode: string;
    public id: string;
    public denpencies: Array<string> = [];
    public ast: Ast;
    public evalResult: any;
    public isTraverse: boolean = false;
    public isTranspiled: boolean = false;
    public module: {
        exports: any;
        isLoad: Boolean;
    } = {
        exports: {},
        isLoad: false
    };
    public isLoad: boolean = false;
    constructor({code, path}){
        this.code = code;
        this.path = path;
        this.type = File.filenameToFileType(path);
        this.ast = new Ast(code);
        this.id = TranspilerModule.getIdByPath(path);
    }
    translate() {
        const transformResult = babel.transform(this.code, {
            presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
            plugins: [[plugins, {path: this.path}]]
        });
        this.transpiledCode = transformResult.code;
        // console.log(transformResult.code.replace(/\n/g, '\n').replace(/"/g, '\"'))
        this.isTranspiled = true;
    }
    public getModuleFunction() {
        const _this = this;
        if(!this.isTranspiled) {
            this.translate();
        }
        return function(module, exports, __edith_require__) {
            eval(_this.transpiledCode)
        }
    }
    public static getIdByPath(path: string) {
        return md5(path);
    }

}