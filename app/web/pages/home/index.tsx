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
    // console.log(fs)
    const { location: { query }} = this.props;
    this.props.dispatch({
      type: 'home/getProjectFileList',
      payload: { projectId: 4260, name: query.name || 'test'}
    }).then((fileList) => {
      // vscodeManager.init({
      //   name: query.name,
      //   fileList,
      //   container: this.vscodeRef.current
      // })
    })
    eventBus.on('browser-reload', () => {
      const { home: {vscode: { fileList }}} = this.props;
      console.log(fileList)
      if (fileList.length > 0) {
        eventBus.emit('saveFileList', fileList);
      }
    })
    //监听来自子iframe的消息
    window.addEventListener('message', (e: MessageEvent) => {
      if (is.object(e.data)) {
        eventBus.emit(e.data.type, e.data.payload);
      }
    }, false)
  }
  dispatch = ({type, payload}) => {
    const { dispatch } = this.props;
    dispatch({
      type: `home/${type}`,
      payload
    })
  }
  render() {
    const { home: { vscode: { fileList, editFileList, activeFileId}} } = this.props;
    return (
      <div className="home-page">
        <div className="vscode" ref={this.vscodeRef}></div>
        <div className="Preview">
          <Preview></Preview>
        </div>
        {/* <MonacoEditor 
          height="90vh" 
          language="css"
          theme='dark'
          /> */}
          
      </div>
    ) 
  }
}
