import * as React from 'react';
// import router from 'umi/router';
// import MonacoEditor from '../../components/MonacoEditor'
import Vscode from '../../components/Vscode'
// import MonacoEditor from '@monaco-editor/react';
import  './index.scss';
import { connect } from 'dva';
interface HomeProps {
  dispatch: Function;
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
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // console.log(fs)
    this.props.dispatch({
      type: 'home/getProjectFileList',
      payload: { projectId: 4260, path: ''}
    })
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
        {/* <MonacoEditor 
          height="90vh" 
          language="css"
          theme='dark'
          /> */}
          <Vscode
            dispatch={this.dispatch}
            data={
            {fileList, editFileList, activeFileId}
          } />
      </div>
    ) 
  }
}
