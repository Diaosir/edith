import React from "react";
import ReactDOM from "react-dom";
import  './styles.css'
import Button from './Button/index.jsx';
import Input from './Input/index.jsx';
import Tabs from './Tabs/index.jsx';
import Switch from 'antd-mobile/lib/switch';
import * as is from 'is';
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
                <Input></Input>
                <Tabs></Tabs>
                <Switch checked={true}></Switch>
                <h1>Hello world</h1>
                <h2>Start editing to see some magic happen!</h2>
            </div>
          );
    }
}
ReactDOM.render(<App></App>, document.getElementById('root'))
