import File, { FileType } from '@/datahub/project/entities/file';
import md5 from '@/utils/md5'
import { defaultLoaderRules } from '../../loader'
import Transpiler from './transpiler';
import Context from '../../utils/context'
import * as is from 'is';
import getExecuteFunction from './eval'
function hotReLoad(data?) {
    return {
        accept: function() {

        },
        data
    }
}
function compose(middlewares: Array<Function>): Function {
    if (!Array.isArray(middlewares)) throw new TypeError('Middleware stack must be an array!')
    for(const fn of middlewares) {
        if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
    }
    return function(ctx) {
        function dispatch(index: number) {
        const fn = middlewares[index];
        if (!fn) {
            return Promise.resolve()
        }
        try {
            return Promise.resolve(fn(ctx, dispatch.bind(null, index + 1)))
        } catch(error) {
            return Promise.reject(error);
        }
        }
        return dispatch(0);
    }
}
export default class TranspilerModule {
    public type: FileType;
    public id: string;
    private _denpencies: Map<string, string> = new Map(); //TODO 去重
    private _parents: Array<string> = [];
    public isTraverse: boolean = false;
    private _isTranslate: boolean = false;
    public ctx: Context = new Context();
    set code(newCode){
        this.ctx.code = newCode;
    }
    get code() {
        return this.ctx.code;
    }
    set path(pathName) {
        this.ctx.path = pathName;
    }
    get path() {
        return this.ctx.path;
    }
    set isEntry(isEntry: boolean) {
        this.ctx.isEntry = isEntry
    }
    get isEntry() {
        return this.ctx.isEntry || false;
    }
    protected set transpilingCode(transpilingCode: string) {
        this.ctx.transpilingCode = transpilingCode;
    }
    protected get transpilingCode() {
        return this.ctx.transpilingCode;
    }
    public module: {
        exports: any;
        isLoad: Boolean;
        hot?: any;
    } = {
        exports: {},
        isLoad: false,
        hot: hotReLoad()
    };
    constructor({code, path }){
        this.code = code;
        this.path = path;
        this.type = File.filenameToFileType(path);
        this.id = TranspilerModule.getIdByPath(path);
        this.ctx.manager = Transpiler;
    }
    public async translate(isForce: boolean = false) {
        //TODO 处理less类型
        if (!isForce && this._isTranslate){
            return;
        }
        const fn = await this.composeTranslateMiddlewares();
        //编译前重新赋值
        this.transpilingCode = this.code;
        await fn(this.ctx);
        if (!this.ctx.error) {
            if (is.array(this.ctx.denpencies)) {
                this._denpencies.forEach((value, key) => {
                    if (!this.ctx.denpencies.includes(key)) {
                        this.removeDenpency(key);
                    }
                })
            }
            this._isTranslate = true;
            this.module.isLoad = false;
        }
    }
    public async composeTranslateMiddlewares() {
        const loaderList = defaultLoaderRules[this.type];
        if (!Array.isArray(loaderList) || loaderList.length === 0) {
            throw new Error(`not loader to handle this file: ${this.path}`);
        }
        const middlewares = new Array(loaderList.length);
        
        //必须确保loader的顺序
        if (Array.isArray(loaderList) && loaderList.length > 0) {
            await Promise.all(loaderList.map( async (loaderName, index) => {
                const loader = await this.ctx.getLoader(loaderName);
                if (loader) {
                    middlewares[index] = (loader.translate);
                } else {
                    throw new Error(`can not load this loader: ${loaderName}`);
                }
            }))
        }
        return compose(middlewares);
    }
    public getModuleFunction() {
        return getExecuteFunction({
            code: this.transpilingCode,
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
            // is.function(this.loader.quit) && this.loader.quit(this.path);
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
