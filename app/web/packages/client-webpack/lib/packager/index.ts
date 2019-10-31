import LazyLoad from '../Lazyload';
import path from 'path'
interface Idependency {
    semver: string,
    resolved: string,
    parents: Set<String>,
    children: Set<String>,
    entry: string,
    name: string
}
export default class Packager {
    public contents: {
        [key: string]: {
            content: string;
            requires?: Array<string>
        }
    };
    public dependencyTree: any;
    public dependencyDependencies: Map<string, Idependency> = new Map()
    constructor(){
        
    }
    public async init(dependencies) {
        await this.generateDependencies(dependencies);
        console.log(this.dependencyDependencies)
    }
    public formatDependencies(dependencies) {
        return Object.keys(dependencies).map(name => {
            return {
                name,
                semver: dependencies[name],
                version: dependencies.vesion
            }
        })
    }
    protected async generateDependencies(dependencies: any, isTraverseChildren: Boolean = true) {
        const _super = this;
        // const deps = this.formatDependencies(dependencies)
        await travsedDendencyDependencies(dependencies);
        // for( let i = 0; i < deps.length; i++) {
        //     travsedDendencyDependencies(deps[i]);
        // }
        async function travsedDendencyDependencies(dependencies, parent: string = '') {
            if (!dependencies || Object.keys(dependencies).length === 0) {
                return
            }
            const deps = _super.formatDependencies(dependencies)
            for( let i = 0; i < deps.length; i++) {
                if (!_super.dependencyDependencies.get(deps[i].name)) {
                    const { dependencies, name, version, main } = await LazyLoad.loadPackageJson(deps[i].name, deps[i].semver);
                    _super.setDependencyDependencies({ name, version, semver: deps[i].semver, entry: main}, parent, dependencies);
                    isTraverseChildren && await travsedDendencyDependencies(dependencies, deps[i].name);
                }
            }
        }
    }
    protected setDependencyDependencies(dependency, parent: string, children: Set<String>) {
        const dep = this.dependencyDependencies.get(dependency.name);
        if (dep) {
            dep.parents.add(parent);
        } else {
            this.dependencyDependencies.set(dependency.name, {
                children: children,
                parents: new Set([parent]),
                semver: dependency.semver,
                resolved: dependency.version,
                entry: dependency.entry,
                name: dependency.name
            })
        }
    }
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
        return await LazyLoad.getPackageFileContent(data.name, data.version, data.filePath, data.projectName);
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
        await this.generateDependencies(dependencies, isTraverseChildren );
    }
}