import { Component } from 'react'
import { File } from '../../../../../interface/File';
import './index.scss'
import { Icon } from 'antd'
interface FileItemProps{
  data: File;
}
export default class FileItem extends Component<FileItemProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }
  render() {
    const { data: { name, type }, data} = this.props;
    return (
      <div className="file-item html" onClick={() => { this.setState({open: !this.state.open})}}>
        <div className="file-type-icon-wrap">
          <span className="file-icon">
            <Icon type={data.getIconName()}></Icon>
          </span>
        </div>
        <div className="file-title-container">{name}</div>
        <div className="file-right-controller"></div>
      </div>
    )
  }
}