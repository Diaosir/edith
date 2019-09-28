import { Component } from 'react'
import './index.scss'
import * as polished from 'polished';
import { Tabs, Icon, Tooltip } from 'antd';
import { ControlledEditor } from '@monaco-editor/react';
import File from '@/datahub/project/entities/file';

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
    return {
      panes: fileList,
      activeKey: activeFileId
    }
    // return null;
  }
  handleTabClick(file: File) {
    this.setState({
      activeKey: `${file.fid}`
    })
    this.props.dispatch({
      type: 'setFileActive',
      payload: file
    })
  }
  closeItem = (file: File, e: Event) => {
    e.stopPropagation();
    this.props.dispatch({
      type: 'editorRemoveItem',
      payload: file
    })
  }
  handleEditorChange (file: File, ev, value) {
    this.props.dispatch({
      type: 'editorSaveFileContent',
      payload: {
        file,
        value
      }
    })
  }
  renderTabBar = (props) => {
    return (
      <div className="monaco-editor-top-bar">
        {
            this.state.panes.map(pane => {
              return (
                <div className={`${props.className} show-file-icons monaco-editor-tab ${`${pane.fid}` === props.activeKey ? 'monaco-editor-tab-active' : ''}`} 
                  key={pane.fid} 
                  onClick={() => this.handleTabClick(pane)}
                  >
                    <div className={`edith-icon-label file-icon index.js-name-file-icon js-ext-file-icon ext-file-icon ${pane.getIconName()}-lang-file-icon tab-label`}>
                      <Tooltip 
                        placement="topLeft" 
                        title={pane.path}
                        overlayStyle={{
                          fontSize: 12
                          }}
                        >
                        <div className="monaco-icon-label-description-container">
                          <a className="label-name">
                            {
                              pane.name
                            }
                          </a>
                        </div>
                      </Tooltip>
                      
                    </div>
                    <div className={`tab-close ${pane.isDirty() ? 'is-dirty': ''}`}>
                      <div className="monaco-action-bar">
                        <a className="action-label close-editor-action">
                          <Icon type="close" onClick={this.closeItem.bind(this, pane)}></Icon>
                        </a>
                        <a className="action-label dirty-editor-action">
                          <span className="dirty-icon"></span>
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
              animated={false}
            >
              {this.state.panes.map(file => (
                <TabPane tab={file.name} key={`${file.fid}`} className="tab-pane">
                  <div className="monaco-editor">
                    <ControlledEditor 
                      height="100%" 
                      width="100%"
                      value={file.getValue()}
                      language={file.getIconName()}
                      onChange={this.handleEditorChange.bind(this, file)}
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