import React, { useState } from "react";
import ReactDOM from "react-dom";
import  './styles.css'
import Button from './Button/index.jsx';
import Input from './Input/index.jsx';
import Tabs from './Tabs/index.jsx';
import 'antd-mobile/dist/antd-mobile.less'
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
                <Button>11</Button>
                <Tabs></Tabs>
                <Tabs></Tabs>
                <Tabs></Tabs>
                <Tabs></Tabs>
                <Tabs></Tabs>
                <Tabs></Tabs>
                <Tabs></Tabs>
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('root'))


//测试类似dom-helpers@5.1.0/addClass获取不到的情况
// require('dom-helpers@5.1.0/addClass');