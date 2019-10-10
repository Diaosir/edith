import File, { FileType } from '@/datahub/project/entities/file';
import * as babel from '@babel/standalone';
import Ast from '../ast';
import md5 from '@/utils/md5'
// import typescriptPreset from '@babel/preset-typescript'
export default class TranspilerModule {
    path: string;
    type: FileType;
    code: string;
    transpiledValue: string;
    public id: string;
    public denpencies: Array<string> = [];
    public ast: Ast;
    public evalResult: any;
    public isTraverse: boolean = false;
    constructor({code, path}){
        this.code = code;
        this.path = path;
        this.type = File.filenameToFileType(path);
        this.ast = new Ast(code);
        this.id = TranspilerModule.getIdByPath(path);
    }
    translate() {
        return babel.transform(this.code, {
            presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react']
        });
    }
    public moduleEval() {
        const translateCode = this.translate().code;
        try{
            this.evalResult = eval(translateCode);
        } catch(error) {

        }
    }
    public static getIdByPath(path: string) {
        return md5(path);
    }
}