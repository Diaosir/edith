import File, { FileType } from '@/datahub/project/entities/file';
import md5 from '@/utils/md5'
import Loader, { BaseLoader } from '../../loader'
import Transpiler from './transpiler';
export default class TranspilerModule {
    public path: string;
    public type: FileType;
    public code: string;
    protected transpiledCode: string;
    public id: string;
    private _denpencies: Set<string>; //TODO 去重
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
        this.loader = Loader(this.type)
        this.setAllPackages(code);
        this._denpencies = new Set();
    }
    public async translate() {
        //TODO 处理less类型
        if (this._isTranslate){
            return;
        }
        const { result, isError } = await this.loader.translate({
            code: this.code,
            path: this.path,
            context: Transpiler
        });
        if (!isError) {
            this.transpiledCode = result;
            //重新编译完成设置待执行
            this._isTranslate = true;
            this.module.isLoad = false;
        }
    }
    public getModuleFunction() {
        return this.loader.execute({
            code: this.transpiledCode,
            path: this.path
        });
    }
    public static getIdByPath(path: string) {
        return md5(path);
    }
    public async reset(newCode: string) {
        this.code = newCode;
        this._isTranslate = false;
        this.isTraverse = false;
    }
    public setAllPackages(code: string) {
        this.allPackages = this.loader.getDependencies(code);
    }
    public async getNewPackages(newCode: string): Promise<any> {
        const newAllPackages =  this.loader.getDependencies(newCode);
        const diffPackages = newAllPackages.filter((packageName => {
            return !this.allPackages.includes(packageName);
        }))
        this.allPackages = newAllPackages;
        return diffPackages;
    }
    public addDenpency(denpency: string) {
        this._denpencies.add(denpency);
    }
    public getDenpencies(): Array<string> {
        return Array.from(this._denpencies);
    }
}
