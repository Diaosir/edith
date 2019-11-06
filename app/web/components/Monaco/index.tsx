import { Component, createRef } from 'react'
import monaco from './monaco';
import themes from './themes'
import './index.scss'
import TypingsFetcherWorker from 'worker-loader?publicPath=/&name=monaco-typings-ata.[hash:8].worker.js!./workers/fetch-dependency-typings';
import BrowserFs from '@/packages/browserfs'
import * as path from 'path'
import File, { FileType } from '@/datahub/project/entities/file'
interface MonacoEditorProps {
  value: string;
  filename: string;
  language: string;
  editorDidMount?: Function;
  theme: string;
  line?: number;
  width?: number | string;
  height?: number | string;
  options?: {
    [key: string]: any
  },
  dependencies?: {
    [key: string]: string
  };
  fileList?: Array<any>;
  onChange?: Function;
  modules?: Array<File>
}
//https://blog.csdn.net/weixin_30376453/article/details/94965152
//this.monaco.languages.registerCompletionItemProvider('typescript' //自定义
export default class MonacoEditor extends Component<MonacoEditorProps, any> {
  public editorRef: any = createRef();
  public monacoRef: any = createRef();
  public containerRef: any = createRef();
  public typingsFetcherWorker: any = null;
  tsConfig?: {
    [key: string]: any
  };
  static defaultProps = {
    width: '100%',
    height: '100%',
    options: {},
    language: 'typescript',
    value: '',
    theme: 'dark',
    dependencies: {
      'react': '16.11.0',
      'antd-mobile': '2.3.1'
    }
  };
  constructor(props) {
    super(props);
    this.tsConfig = props.tsConfig || {};
  }
  monacoReady() {
    window.addEventListener('resize', this.resizeEditor);
    this.createEditor();
  }
  resetTsConfig = (config: any) => {
    this.tsConfig = config;
    this.setCompilerOptions();
  }
  setCompilerOptions = () => {
    const existingConfig = this.tsConfig ? this.tsConfig.compilerOptions || {} : {};
    const jsxFactory = 'React.createElement';
    const reactNamespace = 'React';
    const monaco = this.monacoRef.current;
    const compilerDefaults = {
      jsxFactory,
      reactNamespace,
      jsx: monaco.languages.typescript.JsxEmit.React,
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: false,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ES2015,
      experimentalDecorators: true,
      noEmit: true,
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      newLine: monaco.languages.typescript.NewLineKind.LineFeed
    }
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      compilerDefaults
    );
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
      compilerDefaults
    );
    // monaco.languages.typescript.typescriptDefaults.addExtraLib(
    //   `
    //   export { default as Button } from './button/index';
    //   export declare function next() : string`,
    //   'file:///node_modules/@types/external/index.d.ts');

    //   monaco.languages.typescript.typescriptDefaults.addExtraLib(
    //     `
    //       declare class Button {
    //         static defaultProps: {
    //             prefixCls: string;
    //             size: string;
    //             inline: boolean;
    //             disabled: boolean;
    //             loading: boolean;
    //             activeStyle: {};
    //         };
    //         name: string;
    //         render(): string;

    //     }
    //     export default Button;
    //     `,
    //     'file:///node_modules/@types/external/button/index.d.ts');

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

  }
  registerAutoCompletions = () => {
    const monaco = this.monacoRef.current;
    const { filename, modules } = this.props;
    monaco.languages.registerCompletionItemProvider('typescript', {
      triggerCharacters: ['"', "'", '/'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange(
          {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          1
        );
        var suggestions = [];
        if (
          /(([\s|\n]from\s)|(\brequire\b\())["|']\S*$/.test(textUntilPosition)
        ) {
          if (textUntilPosition.endsWith('/')) {
            const prefix = textUntilPosition.match(/["|'](\S*)$/)[1];
            const relativePath = path.join(path.dirname(filename), prefix);
            let chilrenFiles: Array<File> = []
            if(relativePath === '/') {
              chilrenFiles = modules;
            } else {
              File.recursion(modules, function(file) {
                if (`/${file.path}/` === relativePath) {
                  console.log(file)
                  chilrenFiles = file.children;
                }
              })
            }
            return {
              suggestions: chilrenFiles.map(file => {
                let filePath = file.path.replace(new RegExp(`^${relativePath.slice(1)}`), '');
                let insertText = filePath
                if(filePath.endsWith('.js')) {
                  insertText = filePath.replace(/\.js$/, '')
                }
                if (filePath.endsWith('.ts')) {
                  insertText = filePath.replace(/\.ts$/, '');
                }
                return {
                  label: filePath,
                  insertText: insertText,
                  detail: filePath,
                  kind: file.type === FileType.FOLDER ? monaco.languages.CompletionItemKind.Folder : monaco.languages.CompletionItemKind.File
                }
              })
            }
          }
          const dependencies = this.props.dependencies;
          if (dependencies) {
            return {
              suggestions: Object.keys(dependencies).map(name => ({
                label: name,
                detail: dependencies[name],
                insertText: name,
                kind: monaco.languages.CompletionItemKind.Module
              }))
            }
          }
        }
        return {
          suggestions
        }
      }
    });
    console.log(monaco.languages)
  }
  registerPlugins(plugins) {

  }
  registerTypescriptDefaults() {
   
  }
  createEditor() {
    const {value, language, theme, filename } = this.props;
    const monaco = this.monacoRef.current;
    this.editorRef.current = monaco.editor.create(this.containerRef.current, {
      model: monaco.editor.createModel(value, language , new monaco.Uri({ path: filename, scheme: 'file' }))
    });
    this.editorDidMount()
    this.monacoRef.current.editor.defineTheme('dark', themes['night-dark']);
    this.monacoRef.current.editor.setTheme(theme);
    if (language === 'typescript') {
      this.setCompilerOptions();
      this.registerAutoCompletions();
      this.setupTypeWorker();
    } 
  }
  editorDidMount() {
    const { value, onChange } = this.props; 
    const editor = this.editorRef.current
    editor.onDidChangeModelContent(ev => {
      const newValue = editor.getValue();
      if (value !== newValue && typeof onChange === 'function') {
        onChange(newValue);
      }
    })
  }
  componentDidMount() {
    monaco.init().then(monaco => {
      console.log(monaco)
      this.monacoRef.current = monaco;
      this.monacoReady();
    })
  }
  fetchDependencyTypings = (dependencies: Object) => {
    const monaco = this.monacoRef.current;
    if (this.typingsFetcherWorker) {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
        {
          noSemanticValidation: true,
          noSyntaxValidation: true,
        }
      );
      this.typingsFetcherWorker.postMessage({ dependencies });
    }
  };
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeEditor);
    if (this.typingsFetcherWorker) {
      this.typingsFetcherWorker.terminate();
    }
  }
  resizeEditor = () => {
    this.forceUpdate(() => {
      if (this.editorRef.current) {
        this.editorRef.current.layout();
      }
    });
  };
  addLib = (code: string, path: string) => {
    const monaco = this.monacoRef.current;
    const fullPath = `file://${path}`;

    const existingLib = monaco.languages.typescript.typescriptDefaults.getExtraLibs()[
      fullPath
    ];
    // Only add it if it has been added before, we don't care about the contents
    // of the libs, only if they've been added.
    if (!existingLib) {
      // We add it manually, and commit the changes manually
      // eslint-disable-next-line no-underscore-dangle
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        code,
        fullPath
      )
    }
  };
  setupTypeWorker = () => {
    this.typingsFetcherWorker = new TypingsFetcherWorker();
    this.typingsFetcherWorker.addEventListener('message', event => {
      console.log(event)
      const regex = /node_modules\/(@types\/.*?)\//;
      Object.keys(event.data).forEach((path: string) => {
        const typings = event.data[path];
        this.addLib(typings, '/' + path);
      });
    });
    this.fetchDependencyTypings(this.props.dependencies)
  }
  render() {
    const { width, height } = this.props;
    return (
      <div className="MonacoEditor" ref={this.containerRef} style={{width: width, height: height}}></div>
    )
  }
}