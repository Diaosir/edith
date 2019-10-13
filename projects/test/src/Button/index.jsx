// import { Button } from 'antd-mobile'
// import "rmc-cascader"
// import Zepto from  './zepto.js'
import  React  from 'react'
import './index.less'
export default class Button extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div className="button">{this.props.children}</div>
    )
  }
}
