import { Component } from 'react'
import './index.scss'
import * as polished from 'polished';
import { Tabs, Icon } from 'antd';
import Editor from '@monaco-editor/react';
import { File } from '../../../../interface/File'
const { TabPane } = Tabs;
interface State {
  panes: Array<File>;
  activeKey: string;
}
export default class EditorGroup extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '',
      panes: [],
    };
  }
  static getDerivedStateFromProps(nextProps, preState) {
    const { fileList, activeFileId } = nextProps;
    if(fileList !== preState.panes) {
      return {
        panes: fileList,
        activeKey: activeFileId
      }
    }
    // if (`${monacoEditorActiveFileId}` !== preState.activeKey) {
    //   return {
    //     activeKey: monacoEditorActiveFileId
    //   }
    // }
    return null;
  }
  handleTabClick(activeKey: string) {
    this.setState({
      activeKey
    })
  }
  closeItem = (pane) => {

  }
  renderTabBar = (props) => {
    return (
      <div className="monaco-editor-top-bar">
        {
            this.state.panes.map(pane => {
              return (
                <div className={`${props.className} monaco-editor-tab ${`${pane.fid}` === props.activeKey ? 'monaco-editor-tab-active' : ''}`} 
                  key={pane.fid} 
                  onClick={() => this.handleTabClick(`${pane.fid}`)}
                  >
                    <div className="monaco-icon-label">
                      <div className="monaco-icon-label-description-container">
                        <a className="label-name">
                          {
                            pane.name
                          }
                        </a>
                      </div>
                    </div>
                    <div className="tab-close" onClick={() => this.closeItem(pane)}>
                      <div className="monaco-action-bar">
                        <a className="action-label close-editor-action">
                          <Icon type="close"></Icon>
                        </a>
                      </div>
                    </div>
                </div>
              )
          })
        }
      </div>
    )
  }
  render() {
    return (
      <div className="editor-group-container">
        <div className="vscode-editor-container">
          <div className="monaco-tab-container">
            <Tabs
              activeKey={`${this.state.activeKey}`}
              renderTabBar={this.renderTabBar}
            >
              {this.state.panes.map(pane => (
                <TabPane tab={pane.name} key={`${pane.fid}`} className="tab-pane">
                  <div className="monaco-editor">
                    <Editor 
                      height="100%" 
                      width="100%"
                      language="typescript"
                      theme='dark' 
                      />
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </div>
          <div className="editor-actions"></div>
        </div>
      </div>
    )
  }
}