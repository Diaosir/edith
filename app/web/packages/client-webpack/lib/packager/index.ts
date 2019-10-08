import LazyLoad from '../lazyload';

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
        entries: Array<string>
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
                parent && _super.setDependencyDependencies({ name, version, semver: deps[i].semver, entry: main}, parent);
                await travsedDendencyDependencies(dependencies, deps[i].name);
            }
            // Object.keys(dependencies).forEach(async depName => {
            //     _super.setDependencyDependencies({ name: depName, version: 'latest'}, parent);
            //     const {dependencies: dependencyDependencies } = await LazyLoad.loadPackageJson(depName, dependencies[depName]);
            //     travsedDendencyDependencies(dependencyDependencies, depName);
            // })
        }
        console.log(this.dependencyDependencies)
    }
    protected setDependencyDependencies(dependency, parent: string) {
        if (this.dependencyDependencies[dependency.name]) {
            this.dependencyDependencies[dependency.name].parents.add(parent)
        } else {
            this.dependencyDependencies[dependency.name] = {
                parents: new Set().add(parent),
                semver: dependency.semver,
                resolved: dependency.version,
                entry: dependency.entry || 'index.js'
            }
        }
    }
    public getPackageFile(packageName, version, filepath) {
        return LazyLoad.getPackageFileContent(packageName, version, filepath)
    }
}