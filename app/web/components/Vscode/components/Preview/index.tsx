import { Component } from 'react'
import './index.scss'
import { Tabs } from 'antd';
import Browser from '../Browser'
import DevTools from '../../../../packages/devtools'
import Terminal from '@/components/Terminal';
const { TabPane } = Tabs;
export default class Preview extends Component<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: 'browser',
      panes: [
        {
          title: 'Browser',
          id: 'browser',
          content: <Browser />
        },
        {
          title: 'Console',
          id: 'test',
          content: <Terminal />
        }
      ]
    }
  }
  handleTabClick(id) {
    console.log(id)
    this.setState({
      activeKey: id
    })
  }
  renderTabBar = (props) => {
    return (
      <div className="monaco-editor-top-bar">
        {
          this.state.panes.map(pane => {
            return (
              <div 
                className={`${props.className} monaco-editor-tab ${`${pane.id}` === props.activeKey ? 'monaco-editor-tab-active' : ''}`} 
                key={pane.id}
                onClick={() => this.handleTabClick(`${pane.id}`)}
                >               
                <div className="monaco-icon-label-description-container">
                  <a className="label-name">
                    {pane.title}
                  </a>
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
      <div className="preview-container">
        <Tabs 
          defaultActiveKey="browser"
          activeKey={`${this.state.activeKey}`}
          renderTabBar={this.renderTabBar}
          >
          {this.state.panes.map(pane => (
            <TabPane tab={pane.title} key={`${pane.id}`} className="tab-pane">
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        <div className="dev-tools-container">
          <DevTools/>
        </div>
      </div>
    )
  }
}