import LazyLoad from '../Lazyload';
import api from 'edith-utils/lib/api';
import Manager from '../manager'
import { URI } from 'edith-types/lib/uri'
import _ from 'lodash'
import FetchFs from 'edith-types/lib/file/fetchFs';
const unpkgFileSystem = new FetchFs('unpkg', 'https://unpkg.com');
import path from 'path-browserify'
interface IdependencyDependency {
    semver: string,
    resolved: string,
    parents: Array<string>;
    children?: Set<String>,
    name: string
}
interface Idependency{
    version: string;
    name: string
}
export default class Packager {
    public contents: {
        [key: string]: {
            content: string;
            requires?: Array<string>
        }
    };
    public dependencies: Array<Idependency> = [];
    public dependencyDependencies: Map<string, IdependencyDependency> = new Map();
    constructor(){

    }
    public async init(dependencies) {
       await this.combinationsDependencies(dependencies);
       console.log(this)
    }
    // public formatDependencies(dependencies) {
    //     return Object.keys(dependencies).map(name => {
    //         return {
    //             name,
    //             semver: dependencies[name],
    //             version: dependencies.vesion
    //         }
    //     })
    // }
    // protected async generateDependencies(dependencies: any, isTraverseChildren: Boolean = true) {
    //     const _super = this;
    //     // const deps = this.formatDependencies(dependencies)
    //     await travsedDendencyDependencies(dependencies);
    //     // for( let i = 0; i < deps.length; i++) {
    //     //     travsedDendencyDependencies(deps[i]);
    //     // }
    //     async function travsedDendencyDependencies(dependencies, parent: string = '') {
    //         if (!dependencies || Object.keys(dependencies).length === 0) {
    //             return
    //         }
    //         const deps = _super.formatDependencies(dependencies)
    //         for( let i = 0; i < deps.length; i++) {
    //             if (!_super.dependencyDependencies.get(deps[i].name)) {
    //                 const { dependencies, name, version, main } = await LazyLoad.loadPackageJson(deps[i].name, deps[i].semver);
    //                 _super.setDependencyDependencies({ name, version, semver: deps[i].semver, entry: main}, parent, dependencies);
    //                 isTraverseChildren && await travsedDendencyDependencies(dependencies, deps[i].name);
    //             }
    //         }
    //     }
    // }
    // protected setDependencyDependencies(dependency, parent: string, children: Set<String>) {
    //     const dep = this.dependencyDependencies.get(dependency.name);
    //     if (dep) {
    //         dep.parents.add(parent);
    //     } else {
    //         this.dependencyDependencies.set(dependency.name, {
    //             children: children,
    //             parents: new Set([parent]),
    //             semver: dependency.semver,
    //             resolved: dependency.version,
    //             name: dependency.name
    //         })
    //     }
    // }
    public async getPackageFileOnlyPath(filepath: string) {
        // const { ext, dir, name } = path.parse(filepath);
        const dependency = this.getDependencyByFilePath(filepath);
        if (dependency) {
            const { name, resolved, entry} = dependency;
            let [projectName, realPath] = filepath.replace(`@${resolved}`, '').split(`node_modules/${name}`);
            const result = await this.loadFile({
                name, 
                version: resolved, 
                filePath: realPath || entry, 
                projectName
            });
            if (result.isError) {
                console.log(filepath)
            }
            return result;
        }
        return {}
    }
    public async loadFile(data: {
        name: string,
        version: string,
        filePath: string,
        projectName?: string
    }) {
        // const uri = URI.parse(`unpkg:/${data.name}${data.version ? `@${data.version}` : ''}${data.filePath ? `/${data.filePath}` : ''}`);
        const uri = URI.parse(`unpkg:/${path.join(`${data.name}${data.version ? `@${data.version}` : ''}`, `${data.filePath ? `/${data.filePath}` : ''}`)}`);
        const code: any = await unpkgFileSystem.readFile(uri);
        const reg = /\/\/realFilename=([\s\S]+)$/;
        const realFilename = code.match(reg)[1];
        return {
            code: code.replace(reg, ''),
            fullPath: path.join(data.projectName, 'node_modules', realFilename)
        }
        // const res = await LazyLoad.getPackageFileContent(data.name, data.version, data.filePath, data.projectName);
        // console.log(res)
        // return res;
    }
    /**
     *
     * 根据链接获取依赖包信息
     * 如test/node_modules/@material-ui/core/lib/index.js，返回@material-ui/core
     * 
     * @param {string} filepath
     * @returns
     * @memberof Packager
     */
    public getDependencyByFilePath(filepath: string) {
        //如果找不到所依赖的包名，匹配开头为{packageName}的包名
        let matchDependency = []
        this.dependencyDependencies.forEach((value, key) => {
            if (new RegExp(`node_modules\\/${key}(@${value.resolved})?`).exec(filepath)) {
                matchDependency.push(value);
            }
        })
        if(matchDependency.length === 0) {  
            throw new Error(`can not find this package ${filepath}`)
        }
        //获取最符合的依赖包
        matchDependency = matchDependency.sort(function(a: Idependency, b: Idependency) {
            return b.name.length - a.name.length;
        })
        return matchDependency[0];
    }
    public async addRootDependency(dependencies: any, isTraverseChildren: Boolean = false) {
        
        await this.combinationsDependencies(dependencies);
        // await this.generateDependencies(dependencies, isTraverseChildren );
    }
    public async combinationsDependencies(dependencies) {
        const { payload: { contents, dependencyDependencies, dependencies: combinationsDependencies } } = await api.v2.packages.combinations(dependencies)
        Object.keys(dependencyDependencies).forEach(key => this.dependencyDependencies.set(key, {
            name: key,
            ...dependencyDependencies[key]
        }))
        this.contents = {
            ...this.contents,
            ...contents
        };
        await Promise.all(combinationsDependencies.map(async item => {
            try{
                const code = contents[`/node_modules/${item.name}/package.json`].content;
                const json = JSON.parse(code)
                this.dependencyDependencies.set(item.name, {
                    name: item.name,
                    resolved: json.version,
                    semver: item.version,
                    parents: []
                })
            }catch(error) {
                console.log(error)
            }
        }))
        this.dependencies = this.dependencies.concat(combinationsDependencies);
        // throw new Error('111')
        // await Promise.all(Object.keys(contents).map( async contentName => {
        //     await Manager.fileService.writeFile(URI.parse(`localFs:test/${contentName}`), contents[contentName].content, { create: true, overwrite: true });
        // }))
    }
}