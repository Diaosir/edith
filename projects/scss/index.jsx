import React, { useState } from "react";
import ReactDOM from "react-dom";
import './scss/index.scss';
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
              111
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('app'))
