import React, { useState } from "react";
import ReactDOM from "react-dom";
import './scss/index.scss';
import './less/index.less';
import Console from 'react-component-console';

 
class App extends React.Component {
  render() {
    return (
      <Console lines={[
        'Hi!',
        'How are you today?'
      ]} />
    );
  }
}
 

ReactDOM.render(<App></App>, document.getElementById('root'))
