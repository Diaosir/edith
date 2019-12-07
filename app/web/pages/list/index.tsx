import * as React from 'react';
// import router from 'umi/router';
import './index.scss';
import { connect } from 'dva';
import eventBus from '@/utils/event'
import * as is from 'is';
import { Icon, Button } from 'antd';
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
@connect(({ home, loading }) => ({
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
  addProject =　() => {
    this.props.dispatch({
      type: 'list/addProject',
      payload: { 
        userName: '李易峰',
        password: '123456'
      }
    })
  }
  render() {
    // const { home: { vscode: { fileList, editFileList, activeFileId}} } = this.props;
    return (
      <div className="list-page">
        <Button onClick={this.addProject}>新增项目</Button>
        <div className="com-group">React</div>
        <div className="com-list">
          {
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => {
              return <div className="com-wrap" key={`pro_${index}`}>
                <div className="com-view">
                  <img width="100%" src="https://screenshots.imgix.net/primefaces/primereact/chart/3.1.8/5d42e64160fbc6001439e6cf/fc3587d7-f2d1-43a7-900f-14d1a7df3a9b.png" />
                </div>
                <div className="frame">
                  <img className="frame-img" src="https://bitsrc.imgix.net/5d666b65ab6a0e8919dc0ee7f9b8ac9e70e67a0c.png?size=46&w=46&h=46&fill=fillmax&bg=fff" />
                </div>
                <div className="com-info">
                  <div className="com-name">material-ui</div>
                  <div className="com-version">tag v3.9.2</div>
                  <div className="com-desc">Chart components are based on Charts.js, an open source HTMLChart components are based on Charts.js, an open source HTML</div>
                </div>
                <div className="com-detail">
                  <Icon type="hdd" theme="filled" style={{ fontSize: '18px', color: '#ccc' }} /> 100K
                </div>
              </div>
            })
          }
        </div>
      </div>
    )
  }
}
