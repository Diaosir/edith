import { Component } from 'react'
import FileItem from '../components/FileItem'
import './index.scss'
interface MenuProps {
  filelist?: Array<any>;
}
export default class Menu extends Component<MenuProps> {
  constructor(props) {
    super(props);
  }
  render() {
    const { filelist } = this.props;
    console.log(filelist)
    return (
      <div className="menu">
        {
          filelist.map(file => {
            return <FileItem data={file} key={file.name}/>
          })
        }
      </div>
    )
  }
}