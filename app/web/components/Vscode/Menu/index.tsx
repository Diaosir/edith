import { Component } from 'react'
import FileItem from '../components/FileItem'
import File from '@/datahub/project/entities/file';
import './index.scss'
interface MenuProps {
  fileList?: Array<File>;
  eventListener?: Function;
  dispatch: Function;
  activeFileId: number;
}
export default class Menu extends Component<MenuProps> {
  constructor(props) {
    super(props);
  }
  handleFileClick = (file: File) => {
    this.props.dispatch({
      type: 'menuFileClickEvent',
      payload: file
    })
  }
  renderChildren(children: Array<File> = [], level: number = 0) {
    return (
      <>
        {
          children.map(file => {
            return (
              <div key={file.fid} >
                {
                  file.isDelete || (
                    <FileItem 
                      activeFileId={this.props.activeFileId}
                      data={file}
                      level={level}
                      onClick={() => this.handleFileClick(file)}
                      dispatch={this.props.dispatch}
                    />
                  )
                }
                {
                  (file.children.length > 0 && file.isOpenChildren) && (
                    <div className="children">
                      {this.renderChildren(file.children, level+1)}
                    </div>
                  )
                }
              </div>
            )
          })
        }
      </>
    )
  }
  render() {
    const { fileList } = this.props;
    return (
      <div className="menu">
        {
          this.renderChildren(fileList, 0)
        }
      </div>
    )
  }
}