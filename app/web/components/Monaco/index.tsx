import { Component, createRef } from 'react'
import monaco from './monaco';
import themes from './themes'
import './index.scss'
interface MonacoEditorProps {
  value: string;
  language: string;
  editorDidMount: Function;
  theme: string;
  line: number;
  width: number | string;
  height: number | string;
  options: {
    [key: string]: any
  }
}

//this.monaco.languages.registerCompletionItemProvider('typescript' //自定义
export default class MonacoEditor extends Component<MonacoEditorProps, any> {
  public editorRef: any = createRef();
  public monacoRef: any = createRef();
  public containerRef: any = createRef();
  static defaultProps = {
    width: '100%',
    height: '100%',
    options: {},
    language: 'typescript',
    value: '',
    theme: 'dark'
  };
  constructor(props) {
    super(props)
  }
  monacoReady() {
    this.createEditor();
  }
  createEditor() {
    const {value, language, theme} = this.props;
    console.log(111)
    this.editorRef.current = this.monacoRef.current.editor.create(this.containerRef.current, {
      value,
      language
    });
    this.monacoRef.current.editor.defineTheme('dark', themes['night-dark']);
    this.monacoRef.current.editor.setTheme(theme)
  }
  componentDidMount() {
    monaco.init().then(monaco => {
      console.log(monaco)
      this.monacoRef.current = monaco;
      this.monacoReady();
    })
  }
  render() {
    return (
      <div className="MonacoEditor-container">
        <div className="MonacoEditor" ref={this.containerRef}></div>
      </div>
    )
  }
}