import File, { FileType } from '@/datahub/project/entities/file';
import md5 from '@/utils/md5'
import Loader, { BaseLoader, defaultLoaderRules } from '../../loader'
import Transpiler from './transpiler';
import Context from '../../utils/context'
import * as is from 'is';
function hotReLoad(data?) {
    return {
        accept: function() {

        },
        data
    }
}
export default class TranspilerModule {
    public path: string;
    public type: FileType;
    public code: string;
    protected transpiledCode: string;
    public id: string;
    private _denpencies: Map<string, string> = new Map(); //TODO 去重
    public evalResult: any;
    private _parents: Array<string> = [];
    public isTraverse: boolean = false;
    private _isTranslate: boolean = false;
    public isEntry: boolean = false;
    public ctx: Context;
    public module: {
        exports: any;
        isLoad: Boolean;
        hot?: any;
    } = {
        exports: {},
        isLoad: false,
        hot: hotReLoad()
    };
    public loader: BaseLoader;
    constructor({code, path }, ctx){
        this.code = code;
        this.path = path;
        this.type = File.filenameToFileType(path);
        this.id = TranspilerModule.getIdByPath(path);
        this.loader = Loader(this.type)
        this.ctx = ctx;
    }
    public async translate(isForce: boolean = false) {
        //TODO 处理less类型
        if (!isForce && this._isTranslate){
            return;
        }
        const { result, isError, denpencies = [] } = await this.loader.translate({
            code: this.code,
            path: this.path,
            context: Transpiler,
            isEntry: this.isEntry,
            isTraverseChildren: !isForce
        });
        if (!isError) {
            this.transpiledCode = result;
            //重新编译完成设置待执行
            if (is.array(denpencies)) {
                this._denpencies.forEach((value, key) => {
                    if (!denpencies.includes(key)) {
                        this.removeDenpency(key);
                    }
                })
            }
            //是否为重新编译
     
            this._isTranslate = true;
            this.module.isLoad = false;
        }
    }
    public async translateMiddlewares() {
        
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
    public async reset(newCode?: string) {
        if(!!newCode) {
            this.code = newCode;
        }
        this._isTranslate = false;
        this.isTraverse = false;
        this.module.isLoad = false;
        this.module.exports = null;
        if (this.type === FileType.VUE) {
            let depNames = this.getDenpencies();
            //过滤掉node_modules
            depNames = depNames.filter(depName => !depName.match(/node_modules/))
            depNames.forEach((depName) => {
                const transpiler = Transpiler.getTranspilerModuleByPath(depName)
                if (transpiler) {
                    transpiler.reset();
                    transpiler.module.hot = hotReLoad({});
                }
                // Transpiler.transpilerModules.delete(depName)
            })
        }
    }
    public addDenpency(key: string, value: string) {
        this._denpencies.set(key, value);
    }
    public getDenpencies(): Array<string> {
        return Array.from(this._denpencies.values());
    }
    public isIncludeChildren(childrenPath: string): boolean {
        let result = false;
        Transpiler.walk(this.path, (transpilerModule: TranspilerModule) => {
            if (transpilerModule.path === childrenPath) {
                result = true;
                return true;
            }
            return false;
        })
        return result;
    }
    public removeDenpency(moduleKey: string) {
        const childrenModule = Transpiler.getTranspilerModuleByPath(this._denpencies.get(moduleKey));
        if (childrenModule) {
            childrenModule.removeParent(this.path);
        }
        this._denpencies.delete(moduleKey);
    }
    public removeParent(removeParents: any) {
        if(is.string(removeParents)) {
            removeParents = [removeParents];
        }
        this._parents = this._parents.filter(parent => !removeParents.includes(parent));
        //如果不存在引用，则退出此模块
        if (this._parents.length === 0) {
            is.function(this.loader.quit) && this.loader.quit(this.path);
        }
    }
    public addParent(parentPath: string) {
        if(!this._parents.includes(parentPath)) {
            this._parents.push(parentPath)
        }
    }
    public getParents() {
        return this._parents;
    }
}
