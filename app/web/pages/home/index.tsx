import * as React from 'react';
// import router from 'umi/router';
// import MonacoEditor from '../../components/MonacoEditor'
import Vscode from '../../components/Vscode'
// import MonacoEditor from '@monaco-editor/react';
import  './index.scss';
export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // console.log(fs)
  }
  render() {
    return (
      <div className="home-page">
        {/* <MonacoEditor 
          height="90vh" 
          language="css"
          theme='dark'
          /> */}
          <Vscode></Vscode>
      </div>
    ) 
  }
}
