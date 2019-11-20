import vscodeManager from '@/packages/vscode'
import './index.scss'
import ProjectService from '@/datahub/project/service';
interface Props {
  dispatch: Function;
  location: any;
  home: {
    vscode: {
      fileList: Array<any>,
      editFileList: Array<any>
      activeFileId: number;
      [key: string]: any
    }
  }
}
/**
 * document: ./documents/vscode.ejs
 */
import { Component } from 'react'
export default class Vscode extends Component<Props, any> {
  componentDidMount() {
    const { location: { query }} = this.props;
    if(query.name) {
      this.getFiles(query.name).then(fileList => {
        vscodeManager.init({
          name: query.name,
          fileList,
          container: document.getElementById('vscode-container')
        })
      })
    }
  }
  getFiles(projectName) {
    return ProjectService.getProjectFileList(111, projectName);
  }
  render() {
    return (
      <div id="vscode-container">
      </div>
    )
  }
}