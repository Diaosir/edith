import { Component, createRef } from 'react'
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
export default class MonacoEditor extends Component<MonacoEditorProps, any> {
  public editorRef: any = createRef();
  static defaultProps = {
    width: '100%',
    height: '100%',
    options: {},
    theme: 'ligth'
  };
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="MonacoEditor-container">
        <div ref={this.editorRef}></div>
      </div>
    )
  }
}