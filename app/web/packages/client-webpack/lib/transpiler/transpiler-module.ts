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
    public parents: Array<string> = [];
    public isTraverse: boolean = false;
    private _isTranslate: boolean = false;
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
    public async translate() {
        // if (this._isTranslate){
        //     return;
        // }
        const { result, isError } = await this.loader.translate(this.code);
  
        if (!isError) {
            this.transpiledCode = result;
            //重新编译完成设置待执行
            this._isTranslate = true;
            this.module.isLoad = false;
        }
    }
    public getModuleFunction() {
        return this.loader.execute(this.transpiledCode);
    }
    public static getIdByPath(path: string) {
        return md5(path);
    }
    public async reset(newCode: string) {
        this.code = newCode;
        this.setAllPackages(newCode);
        this._isTranslate = false;
        await this.translate();
    }
    public setAllPackages(code: string) {
        this.allPackages = this.loader.getDependencies(code);
    }
}
