import * as React from 'react';
// import router from 'umi/router';
// import MonacoEditor from '../../components/MonacoEditor'
import Vscode from '../../components/Vscode'
// import MonacoEditor from '@monaco-editor/react';
import  './index.scss';
import { connect } from 'dva';
import eventBus from '@/utils/event'
import * as is from 'is';
import Preview from '../../components/Vscode/components/Preview'
import vscodeManager from '@/packages/vscode'
interface HomeProps {
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
@connect(({ home, loading}) => ({
  home,
  loading: loading
}))
export default class extends React.Component<HomeProps> {
  public vscodeRef: any = React.createRef()
  constructor(props) {
    super(props);
  }
  componentDidMount() {

  }
  render() {
    const { home: { vscode: { fileList, editFileList, activeFileId}} } = this.props;
    return (
      <div className="list-page">
        list
      </div>
    ) 
  }
}
