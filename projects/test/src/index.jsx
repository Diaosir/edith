import React, { useState } from "react";
import ReactDOM from "react-dom";
import Hooks from './hooks'
import './styles.css';
import json from './test.json';
console.log(json, 99)
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
                <Hooks></Hooks>
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('root'))
