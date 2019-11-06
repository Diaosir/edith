import ControlledEditor from '@/components/Monaco';
import { Component, createRef } from 'react';
import { Debounce } from 'lodash-decorators';
export default class MControlledEditor extends Component<any, any> {
  public editorRef: any = createRef();
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
  componentDidMount(){
  }
  @Debounce(300)
  handleEditorChange(value: any) {
    this.setState({
      value
    })
    if (this.state.value !== value) {
      typeof this.props.onChange === 'function' && this.props.onChange(value);
    }
  }
  render() {
    return (
      <ControlledEditor 
        language={this.props.language}
        {...this.props}
        onChange={this.handleEditorChange.bind(this)}
        value={this.state.value}/>
    )
  }
}