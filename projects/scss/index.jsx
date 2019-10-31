import React, { useState } from "react";
import ReactDOM from "react-dom";
import './scss/index.scss';
import './less/index.less';
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
              11
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('root'))
