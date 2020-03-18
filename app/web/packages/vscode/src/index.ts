import configuration from './config';
import File, { FileType } from '@/datahub/project/entities/file'
import FileSystem from './provider/fileSystem'
import { vscode } from './manager'
interface VscodeOptions {
  name: string;
  fileList: Array<File>;
  container: HTMLElement;
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
  public fileSystem = new FileSystem();
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
    await this.initWorkbench();
  }
  async initFiles(Uri) {
    await this.fileSystem.mkdir(Uri.parse(`localFs:${this.root}`));
    const createFile = async (fileList: Array<File> = []) => {
      if(fileList.length > 0) {
        await Promise.all(fileList.map( async (file) => {
          if (file.type === FileType.FOLDER) {
            await this.fileSystem.mkdir(Uri.parse(`localFs:${this.root}/${file.path}/`));
          } else {
            await this.fileSystem.writeFile(Uri.parse(`localFs:${this.root}/${file.path}`), textEncoder.encode(file.getValue()), { create: true, overwrite: true });
          }
          if (file.children.length > 0) {
            await createFile(file.children);
          }
        }))
      }
    }
    await createFile(this.options.fileList)
    console.log(this.fileSystem)
  }
  async initLoader(){

    return new Promise((resolve, reject) => {
      createScript(`${configuration.rootPath}/static/out/vs/loader.js`, () => {
        global.require.config({
          baseUrl: `${configuration.rootPath}/static/out`,
          paths: {
            'vs/basic-languages': `${configuration.monacoRootPath}/monaco-languages`,
            'vs/language/typescript': `${configuration.monacoRootPath}/monaco-typescript`,
            'vs/language/json': `${configuration.monacoRootPath}/monaco-json`,
            'vs/language/css': `${configuration.monacoRootPath}/monaco-css`,
            'vscode-textmate': `${configuration.rootPath}/static/remote/web/node_modules/vscode-textmate/release/main`,
            'onigasm-umd': `${configuration.rootPath}/static/remote/web/node_modules/onigasm-umd/release/main`,
            'xterm': `${configuration.rootPath}/static/remote/web/node_modules/xterm/lib/xterm.js`,
            'xterm-addon-search': `${configuration.rootPath}/static/remote/web/node_modules/xterm-addon-search/lib/xterm-addon-search.js`,
            'xterm-addon-web-links': `${configuration.rootPath}/static/remote/web/node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js`,
            'semver-umd': `${configuration.rootPath}/static/remote/web/node_modules/semver-umd/lib/semver-umd.js`,
          }
        })
        resolve();
      })
    })
  }
  async initMonaco() {
    const r = global.require;
    // r([
    //   'vs/workbench/services/editor/common/editorService',
    //   'vs/editor/browser/services/codeEditorService',
    //   'vs/workbench/services/textfile/common/textfiles',
    //   'vs/platform/lifecycle/common/lifecycle',
    //   'vs/workbench/services/editor/common/editorGroupsService',
    //   'vs/platform/statusbar/common/statusbar',
    //   'vs/workbench/services/extensions/common/extensions',
    //   'vs/platform/contextview/browser/contextView',
    //   'vs/platform/quickOpen/common/quickOpen',
    //   'vs/platform/instantiation/common/instantiation'
    // ])
    r([
      'vs/workbench/services/editor/common/editorService',
      'vs/editor/browser/services/codeEditorService',
      'vs/workbench/services/textfile/common/textfiles',
      'vs/platform/lifecycle/common/lifecycle',
      'vs/workbench/services/editor/common/editorGroupsService',
      'vs/workbench/services/statusbar/common/statusbar',
      'vs/workbench/services/extensions/common/extensions',
      'vs/platform/contextview/browser/contextView',
      'vs/platform/quickOpen/common/quickOpen',
      'vs/platform/instantiation/common/instantiation',
      'vs/editor/editor.api'
    ], function(...args) {
      const [
        { IEditorService },
        { ICodeEditorService },
        { ITextFileService },
        { ILifecycleService },
        { IEditorGroupsService },
        { IStatusbarService },
        { IExtensionService },
        { IContextViewService },
        { IQuickOpenService },
        { IInstantiationService },
      ] = args;
      const container = document.createElement('div');
      const part = document.createElement('div');
      container.appendChild(part);

      const rootEl = document.getElementById('vscode-container');
      rootEl.appendChild(container);
      console.log(IEditorGroupsService)
      vscode.initializeEditor(
        container,
        {},
        services => (
          console.log(services)
        )
      )
    })

  }
  async initWorkbench() {
    const extensions = this.extensions;
    global.require(['vs/code/browser/workbench/edith', 'vs/code/browser/workbench/memfs'], (workbench, InMemoryFileSystemProvider) => {
      const { WorkspaceProvider, UrlCallbackProvider, CredentialsProvider, create, Uri} = workbench.default;
      // this.fileSystem = new InMemoryFileSystemProvider.InMemoryFileSystemProvider();
      this.initFiles(Uri);
      if (Array.isArray(extensions)) {
        extensions.forEach(extension => {
          extension.extensionLocation = Uri.revive(extension.extensionLocation);
        })
      }
      create(this.options.container || document.body, {
        staticExtensions: extensions,
        folderUri: {scheme: "localFs", path: this.root},
        workspaceProvider: new WorkspaceProvider({
          folderUri: Uri.revive({
            scheme: 'localFs', path: this.root, authority: '', query: '', fragment: ''
          })
        }),
        urlCallbackProvider: new UrlCallbackProvider(),
        credentialsProvider:  new CredentialsProvider(),
        fileSystemProviders: {
          'localFs': this.fileSystem
        }
      }).then((workbench) => {
        global.workbench = workbench;
      })
    });
  }
}
export default new Vscode()
