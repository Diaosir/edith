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
    protected dependencies: Array<{
        name: string,
        version: string
    }>;
    public dependencyDependencies: Map<string, Idependency> = new Map()
    constructor(){
        
    }
    public async init(dependencies) {
        this.dependencies = this.formatDependencies(dependencies);
        await this.generateDependencies(dependencies);
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
    protected async generateDependencies(dependencies) {
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
                const { dependencies, name, version, main } = await LazyLoad.loadPackageJson(deps[i].name, deps[i].semver);
                _super.setDependencyDependencies({ name, version, semver: deps[i].semver, entry: main}, parent, dependencies);
                await travsedDendencyDependencies(dependencies, deps[i].name);
            }
        }
        console.log(this.dependencyDependencies)
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
            const result = await LazyLoad.getPackageFileContent(name, resolved, realPath || entry, projectName);
            if (result.isError) {
                console.log(filepath)
            }
            return result;
        }
        return {}
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
}