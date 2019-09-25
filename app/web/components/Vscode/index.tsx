import { Component } from 'react'
import Menu from './Menu'
import {File, FileType } from '../../../interface/File'

interface VscodeProps {
  data: {
    fileList: Array<File>;
  },
  dispatch: Function;
}
export default class Vscode extends Component<VscodeProps, any>{
  constructor(props) {
    super(props);
  }
  // setFileActive(fid) {
  //   function recursion(filelist: Array<File>) {
  //     if(filelist.length > 0) {
  //       filelist.forEach(file => {
  //         if(file.fid === fid) {
  //           file.active = true;
  //         } else {
  //           file.active = false;
  //         }
  //         if (file.children.length > 0) {
  //           recursion(file.children);
  //         }
  //       })
  //     }
  //   }
  //   recursion(this.state.fileList);
  // }
  // menuEventListener = (name: string, eventData: any) => {

  //   switch(name) {
  //     case 'fileClick':
  //       const file: File = eventData;
  //       if (file.type === FileType.FOLDER) {
  //         file.isOpenChildren = !file.isOpenChildren
  //       } else {
  //         this.setFileActive(file.fid);
  //       }
  //       break;
  //     case 'addFile':
  //       break;
  //   }
  //   this.forceUpdate()
  // }
  render(){
    const { fileList } = this.props.data;
    return (
      <div className="vscode">
        <div className="files">
          <Menu
            dispatch={this.props.dispatch}
            fileList={fileList}></Menu>
        </div>
        <div className="editor"></div>
        <div className="preview"></div>
      </div>
    )
  }
}