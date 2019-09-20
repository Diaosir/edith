import * as React from 'react';
import  './index.scss';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
export default class extends React.Component {
  public monacoRef: any = null;
  constructor(props) {
    super(props);
    this.monacoRef = React.createRef();
  }
  componentDidMount() {
    console.log(this.monacoRef)
    monaco.editor.create(this.monacoRef.current, {
      theme: 'vs-dark', 
      language:"javascript",
      value:`console.log("hello,world")`,
      automaticLayout: true
    })
  }
  render() {
    return (
      <div className="monaco-editor-page" ref={this.monacoRef}></div>
    ) 
  }
}
