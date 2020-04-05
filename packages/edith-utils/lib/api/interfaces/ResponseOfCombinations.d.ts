interface ResponseOfCombinations {
  contents: {
    [key: string]: CombinationContent
  };
  dependencies?: Array<IDependency>;
  dependencyDependencies?: {
    [key: string]: IDependencyDependency
  };
  dependencyAliases: {
    [key: string]: any
  }
}
interface CombinationContent {
  content: string;
  requires?: Array<string>;
  isModule?: boolean;
}

interface IDependency {
  name: string;
  version: string;
}

interface IDependencyDependency {
  entries: Array<string>;
  parents: Array<string>;
  resolved: string;
  semver: string;
}