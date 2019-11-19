import configuration from './config';
import File, { FileType } from '@/datahub/project/entities/file'
// import UserDataProvider from './provider/UserDataProvider'
// console.log(UserDataProvider)
interface VscodeOptions {
  name: string;
  fileList: Array<File>
}
const textEncoder = new TextEncoder();

function createScript(src, onload) {
  var script = document.createElement('script');
  script.src = src;
  script.addEventListener('load', onload);

  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.lastChild);
}
const global = window as {[key: string]: any};
export class Vscode {
  public extensions: Array<any> = [];
  public fileSystem: any;
  public options: VscodeOptions;
  public root: string;
  async initExtensions() {
    this.extensions  = await fetch('http://localhost:8080/getExtensions').then(res => res.json());

  }
  async init(options: VscodeOptions) {
    this.options = options;
    this.root = `/${this.options.name}`;
    await this.initExtensions();
    await this.initLoader();
  }
  async initFiles(Uri) {
    await this.fileSystem.mkdir(Uri.parse(`memfs:${this.root}`));
    const createFile = async (fileList: Array<File> = []) => {
      if(fileList.length > 0) {
        await Promise.all(fileList.map( async (file) => {
          if (file.type === FileType.FOLDER) {
            console.log(file.path)
            await this.fileSystem.mkdir(Uri.parse(`memfs: ${this.root}/${file.path}/`));
          } else {
            await this.fileSystem.writeFile(Uri.parse(`memfs:${this.root}/${file.path}`), textEncoder.encode(file.getValue()), { create: true, overwrite: true });
          }
          if (file.children.length > 0) {
            await createFile(file.children);
          }
        }))
      }
    }
    try{
      await createFile(this.options.fileList)
    } catch(error) {
      
    }
    
    // File.recursion(this.options.fileList || [], (file: File) => {
      
    //   if(file.type === FileType.FOLDER) {
    //     console.log(file.path)
    //     this.fileSystem.mkdir(Uri.parse(`memfs: ${this.root}/${file.path}/`));
    //   }
    // })
    await this.fileSystem.mkdir(Uri.parse(`memfs:${this.root}/src/`));
    await this.fileSystem.writeFile(Uri.parse(`memfs:${this.root}/src/file.yaml`), textEncoder.encode('- just: write something'), { create: true, overwrite: true });
    await this.fileSystem.writeFile(Uri.parse(`memfs:${this.root}/file.js`), textEncoder.encode('console.log("JavaScript")'), { create: true, overwrite: true });
    await this.fileSystem.writeFile(Uri.parse(`memfs:${this.root}/file.ts`), textEncoder.encode('console.log("TypeScript")'), { create: true, overwrite: true });
  }
  async initLoader(){
    const extensions = this.extensions;
    return new Promise((resolve, reject) => {
      createScript(`${configuration.rootPath}/static/out/vs/loader.js`, () => {
        global.require.config({
          baseUrl: `${configuration.rootPath}/static/out`,
          paths: {
            'vs/basic-languages': 'monaco-languages',
            'vs/language/typescript': 'monaco-typescript',
            'vs/language/json': 'monaco-json',
            'vs/language/css': 'monaco-css',
            'vscode-textmate': `${configuration.rootPath}/static/remote/web/node_modules/vscode-textmate/release/main`,
            'onigasm-umd': `${configuration.rootPath}/static/remote/web/node_modules/onigasm-umd/release/main`,
            'xterm': `${configuration.rootPath}/static/remote/web/node_modules/xterm/lib/xterm.js`,
            'xterm-addon-search': `${configuration.rootPath}/static/remote/web/node_modules/xterm-addon-search/lib/xterm-addon-search.js`,
            'xterm-addon-web-links': `${configuration.rootPath}/static/remote/web/node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js`,
            'semver-umd': `${configuration.rootPath}/static/remote/web/node_modules/semver-umd/lib/semver-umd.js`,
          }
        })
        global.require(['vs/code/browser/workbench/edith', 'vs/workbench/services/userData/common/inMemoryUserDataProvider'], (workbench, InMemoryFileSystemProvider) => {
          const { WorkspaceProvider, UrlCallbackProvider, CredentialsProvider, create, Uri} = workbench.default;
          this.fileSystem = new InMemoryFileSystemProvider.InMemoryFileSystemProvider();
          this.initFiles(Uri);
          if (Array.isArray(extensions)) {
            extensions.forEach(extension => {
              extension.extensionLocation = Uri.revive(extension.extensionLocation);
            })
          }
          create(document.getElementById('vscode-container'), {
            staticExtensions: extensions,
            folderUri: {scheme: "memfs", path: this.root},
            workspaceProvider: new WorkspaceProvider({
              folderUri: Uri.revive({
                scheme: 'memfs', path: this.root
              })
            }),
            urlCallbackProvider: new UrlCallbackProvider(),
            credentialsProvider:  new CredentialsProvider(),
            fileSystemProviders: {
              'memfs': this.fileSystem
            }
          })
        });
      })
    })
  }

}

export default new Vscode()
