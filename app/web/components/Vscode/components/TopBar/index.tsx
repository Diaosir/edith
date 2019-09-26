import { Component } from 'react'
import './index.scss'
export default class TopBar extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="editor-topbar">
        <div className="editor-topbar-left"></div>
        <div className="editor-topbar-center"></div>
        <div className="editor-topbar-right"></div>
      </div>
    )
  }
}