import { Component } from 'react';
import { Icon } from 'antd'
interface Props {
  type: string;
}
export default class EIcon extends Component<Props>{
  constructor(props) {
    super(props)
  }
  render() {
    const { type } = this.props;
    return <Icon type={type}></Icon>
  }
}