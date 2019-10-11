import React from "react";
import ReactDOM from "react-dom";
import  Button  from 'antd-mobile/lib/button'
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        console.log(333)
    }
    render() {
        return (
            <div className="App">
                <Button>11</Button>
              <h1>Hello world</h1>
              <h2>Start editing to see some magic happen!</h2>
            </div>
          );
    }
}
ReactDOM.render(<App></App>, document.getElementById('root'))
