import * as React from 'react';
// import router from 'umi/router';
import MonacoEditor from '../../components/MonacoEditor'
import  './index.scss';
export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="home-page">
        <MonacoEditor />
      </div>
    ) 
  }
}
