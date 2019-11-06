import React, { useState } from "react";
import ReactDOM from "react-dom";
import './scss/index.scss';
// import './less/index.less';
import ReactJson from 'react-json-view';
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
              <ReactJson src={{
                a: 'a',
                nb: ['1']
              }} />
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('app'))
