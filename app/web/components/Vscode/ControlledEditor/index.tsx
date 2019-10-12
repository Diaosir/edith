import { ControlledEditor } from '@monaco-editor/react';
import { Component } from 'react';

export default class MControlledEditor extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
  }
  static getDerivedStateFromProps(nextProps, preState) {
    const { value } = nextProps;
    if (preState.value !== value) {
      return {
        value
      }
    }
    return null;
  }
  handleEditorChange(ev, value: any) {
    if (this.state.value !== value) {
      typeof this.props.onChange === 'function' && this.props.onChange(ev,value);
    }
  }
  render() {
    return (
      <ControlledEditor {...this.props} value={this.state.value} onChange={this.handleEditorChange.bind(this)}/>
    )
  }
}