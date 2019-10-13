import File, { FileType } from '@/datahub/project/entities/file';
import md5 from '@/utils/md5'
import Loader, { BaseLoader } from '../../loader'
export default class TranspilerModule {
    public path: string;
    public type: FileType;
    protected code: string;
    protected transpiledCode: string;
    public id: string;
    public denpencies: Array<string> = [];
    public allPackages:  Array<string> = [];
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
    public loader: BaseLoader;
    constructor({code, path}){
        this.code = code;
        this.path = path;
        this.type = File.filenameToFileType(path);
        this.id = TranspilerModule.getIdByPath(path);
        this.loader = Loader(this.type, {path: this.path})
        this.setAllPackages(code);
    }
    translate() {
        const { result, isError } = this.loader.translate(this.code);
        if (!isError) {
            this.transpiledCode = result;
            this.isTranspiled = true;
        }
    }
    public getModuleFunction() {
        if(!this.isTranspiled) {
            this.translate();
        }
        return this.loader.execute(this.transpiledCode);
    }
    public static getIdByPath(path: string) {
        return md5(path);
    }
    public reset(newCode: string) {
        this.code = newCode;
        this.setAllPackages(newCode);
        this.isTranspiled = false;
        this.translate();
    }
    public setAllPackages(code: string) {
        this.allPackages = this.loader.getDependencies(code);
    }
}