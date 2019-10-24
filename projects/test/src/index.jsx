import React, { useState } from "react";
import ReactDOM from "react-dom";
import  './styles.css'
import Button from './Button/index.jsx';
import Tabs from './Tabs/index.jsx';
import 'antd-mobile/dist/antd-mobile.less'
import Icon from 'antd-mobile/lib/icon';
import Slider from 'antd-mobile/lib/slider';
import NavBar from 'antd-mobile/lib/nav-bar';
import Card from 'antd-mobile/lib/card'
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
                <NavBar
                mode="light"
                icon={<Icon type="left" />}
                onLeftClick={() => console.log('onLeftClick')}
                rightContent={[
                    <Icon key="0" type="search" style={{ marginRight: '16px' }} />,
                    <Icon key="1" type="ellipsis" />,
                ]}
                >NavBar</NavBar>
                <Card full>
                <Card.Header
                    title="This is title"
                    thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
                    extra={<span>this is extra</span>}
                />
                <Card.Body>
                    <div>This is content of `Card`</div>
                </Card.Body>
                <Card.Footer content="footer content" extra={<div>extra footer content</div>} />
                </Card>
                <Button>11</Button>
                <Icon type="search" />
                <Slider
                    style={{ marginLeft: 30, marginRight: 30 }}
                    defaultValue={26}
                    min={0}
                    max={30}
                />
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('root'))
import * as is from 'is';
console.log(is)
import hello from './test1.js'
hello('1')

// //测试类似dom-helpers@5.1.0/addClass获取不到的情况
// // require('dom-helpers@5.1.0/addClass');
import './less/index.less'