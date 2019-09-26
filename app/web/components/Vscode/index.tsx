import { Component } from 'react'
import Menu from './Menu'
import {File, FileType } from '../../../interface/File'
import TopBar from './components/TopBar'
import './index.scss'
import MonacoEditor from './MonacoEditor'
import Preview from './components/Preview'
interface VscodeProps {
  data: {
    fileList: Array<File>;
    editFileList: Array<File>;
    [key:string]: any
  },
  dispatch: Function;
}
export default class Vscode extends Component<VscodeProps, any>{
  constructor(props) {
    super(props);
  }
  render(){
    const { fileList, editFileList, activeFileId } = this.props.data;
    return (
      <div className="vscode">
        <TopBar></TopBar>
        <div className="vscode-project-container">
          <div className="vscode-left-bar"></div>
          <div className="vscode-split-pane">
            <div style={{
              width: 249,
              position: 'relative',
              flex: '0 0 auto',
              height: '100vh'
            }}>
              <div className="project-file-pane">
                <div className="">
                  <div className="project-title">
                    <span style={{display: 'inline-block', width: '100%'}}>Explorer</span>
                    <div className="project-title-control"></div>
                  </div>
                  <div className="files">
                    <Menu
                      activeFileId={activeFileId}
                      dispatch={this.props.dispatch}
                      fileList={fileList} />
                  </div>
                </div>
              </div>
            </div>
            <div className="monaco-workbench mac nopanel">
              <MonacoEditor 
                fileList={editFileList}
                activeFileId={activeFileId}
              />
              <Preview></Preview>
            </div>
          </div>
          <div className="vscode-editor-statusBar"></div>
        </div>
      </div>
    )
  }
}