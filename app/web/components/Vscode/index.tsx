import { Component } from 'react'
import Menu from './Menu'
import {File} from '../../../interface/File'
const fileList = [
  new File(
    {
      type: 7,
      name: 'public',
      isLock: false
    }
  ),
  new File({
    type: 7,
    name: 'src',
    isLock: false,
  })
]
export default class Vscode extends Component {
  constructor(props) {
    super(props);
  }
  render(){
    return (
      <div className="vscode">
        <div className="files">
          <Menu filelist={fileList}></Menu>
        </div>
        <div className="editor"></div>
        <div className="preview"></div>
      </div>
    )
  }
}