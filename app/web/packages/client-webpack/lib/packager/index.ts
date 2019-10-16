import LazyLoad from '../Lazyload';
import path from 'path'
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
    public dependencyDependencies: Set<{
        semver: string,
        resolved: string,
        parents: Set<String>,
        children: Set<String>,
        entries: Array<string>,
        name: string
    }> = new Set()
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
        if (this.dependencyDependencies[dependency.name]) {
            this.dependencyDependencies[dependency.name].parents.add(parent)
        } else {
            this.dependencyDependencies[dependency.name] = {
                children: children,
                parents: new Set().add(parent),
                semver: dependency.semver,
                resolved: dependency.version,
                entry: dependency.entry,
                name: dependency.name
            }
        }
    }
    public async getPackageFileOnlyPath(filepath: string) {
        // const { ext, dir, name } = path.parse(filepath);
        filepath = filepath.replace(/@\d+.\d+.\d+/, '');
        const dependency = this.getDependencyByFilePath(filepath);
        if (dependency) {
            const { name, resolved, entry} = dependency;
            let [projectName, realPath] = filepath.split(`node_modules/${name}`);
            const result = await LazyLoad.getPackageFileContent(name, resolved, realPath || entry, projectName);
            return result;
        }
        return {}
    }
    public getDependencyByFilePath(filepath: string) {
        const matchRegResult = /node_modules\/([\w_.-]+)/.exec(filepath);
        let packageName = matchRegResult[1];
        const dependency = this.dependencyDependencies[packageName];
        return dependency;
    }
}