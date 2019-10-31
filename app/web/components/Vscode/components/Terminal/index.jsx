import React, { Component } from 'react';
import Terminal from 'terminal-in-react';

export default class ReactTerminal extends Terminal {
  render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <Terminal
          color='green'
          backgroundColor='black'
          barColor='black'
          style={{ fontWeight: "normal", fontSize: "10px" }}
          commands={{
            'open-google': () => window.open('https://www.google.com/', '_blank'),
            showmsg: 'aaa',
            popup: () => alert('Terminal in React')
          }}
          descriptions={{
            'open-google': 'opens google.com',
            showmsg: 'shows a message',
            alert: 'alert', popup: 'alert'
          }}
          msg='You can write anything here. Example - Hello! My name is Foo and I like Bar.'
        />
      </div>
    );
  }
}
