import React,  { Component } from 'react';

export default class Button extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '1'
    }
  }
  changeText = (text) =>{
    this.setState({
      text: text
    })
  }
  render() {
    return (
      <div className="button" onClick={this.handleClick}>{this.props.children}</div>
    )
  }
}