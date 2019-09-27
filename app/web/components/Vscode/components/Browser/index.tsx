import { Component } from 'react'
import './index.scss'
import { Icon } from 'antd';


export default class Browser extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      url: ''
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
          {/* <iframe src={this.state.url} /> */}
        </div>
      </div>
    )
  }
}