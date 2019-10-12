import { Component, createRef } from 'react'
import './index.scss'
import { Icon } from 'antd';
import eventBus from '@/utils/event'

export default class Browser extends Component<any, any> {
  public browserRef: any = createRef();
  constructor(props) {
    super(props);
    this.state = {
      url: 'http://localhost:8000/#/preview'
    }
  }
  componentDidMount() {
    
    this.browserRef.current.onload = function() {
      eventBus.on('saveFileList', (fileList) => {
        this.contentWindow.postMessage({
          type: 'init',
          payload: fileList
        }, '*');
      })
      eventBus.on('changeFileList', (fileList, file) => {
        this.contentWindow.postMessage({
          type: 'changeFileList',
          payload: {
            fileList,
            file
          }
        }, '*');
      })
    }
  }
  render() {
    return (
      <div className="browser-container">
        <div className="browser-top-bar">
          <Icon type="left" className="browser-action"></Icon>
          <Icon type="right" className="browser-action"></Icon>
          <Icon type="undo" className="browser-action"></Icon>
          <div className="browser-url-container">
            <input aria-label="Address Bar Input" defaultValue={this.state.url}/>
          </div>
          <Icon type="chrome" className="browser-action"></Icon>
        </div>
        <div className="browser-iframe">
          <iframe src={this.state.url} ref={this.browserRef}/>
        </div>
      </div>
    )
  }
}