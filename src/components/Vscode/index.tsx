import { Component } from 'react'
import Menu from './Menu'
import TreeView from './TreeView'
import File, { FileType } from 'edith-types/lib/file';
import TopBar from './components/TopBar'
import './index.scss'
import MonacoEditor from './MonacoEditor'
import Preview from './components/Preview'
import Resizer from '@/components/Resizer'
import LeftBar from './LeftBar'
import ExpansionPanel from './components/ExpansionPanel'
import Denpencies from './Dependencies'
import FileControl from './components/FileControl'
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
  getDenpencies() {
    const { fileList  } = this.props.data;
    let packJsonFile: File = null, dependencies = {};
    File.recursion(fileList, function(file: File) {
      if (file.path === 'package.json') {
        packJsonFile = file;
        return true;
      }
      return false;
    })
    if(packJsonFile) {
      try{
        dependencies = JSON.parse(packJsonFile.getValue()).dependencies;
      } catch(error) {

      }
    }
    return dependencies;
  }
  handleAddFile = () =>{
    console.log(1)
  }
  render(){
    const { fileList, editFileList, activeFileId } = this.props.data;
    const dependencies = this.getDenpencies();
    return (
      <div className="vscode">
        <TopBar></TopBar>
        <div className="vscode-project-container">
          <LeftBar />
          <div className="vscode-split-pane">
            <div style={{
              width: 249,
              position: 'relative',
              flex: '0 0 auto',
              height: 'cacl(100vh - 44px)'
            }}>
              <div className="project-file-pane">
                <div className="pane-inner">
                  <div className="project-title">
                    <span style={{display: 'inline-block', width: '100%'}}>Explorer</span>
                    <div className="project-title-control"></div>
                  </div>
                  <ExpansionPanel
                    rigthElement={
                    <FileControl 
                      onAddFile={this.handleAddFile}
                    />}
                    title={'files'}
                  >
                    <div className="files">
                      {/* <Menu
                        activeFileId={activeFileId}
                        dispatch={this.props.dispatch}
                        fileList={fileList} /> */}
                        <TreeView
                          activeFileId={activeFileId}
                          dispatch={this.props.dispatch} 
                          fileList={fileList}
                        />
                    </div>
                  </ExpansionPanel>
                  <ExpansionPanel
                    title={'denpencies'}
                  >
                    <Denpencies
                      data={dependencies}
                      dispatch={this.props.dispatch}
                    />
                  </ExpansionPanel>
                </div>
              </div>
            </div>
            <div className="monaco-workbench mac nopanel">
              <Resizer 
                LeftComponent={
                  <MonacoEditor 
                    fileList={editFileList}
                    activeFileId={activeFileId}
                    dispatch={this.props.dispatch}
                    modules={fileList}
                    dependencies={dependencies}
                  />
                }
                RightComponent={
                  <Preview/>
                }
              />
            </div>
          </div>
          <div className="vscode-editor-statusBar"></div>
        </div>
      </div>
    )
  }
}