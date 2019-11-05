import React, { useState } from "react";
import ReactDOM from "react-dom";
import './scss/index.scss';
// import './less/index.less';
import ReactScratch from 'react-scratch-perfect/src/index.jsx';
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="App">
              <ReactScratch>
                <div>一等奖</div>
              </ReactScratch>
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('root'))
