// import { Button } from 'antd-mobile'
// import "rmc-cascader"
// import Zepto from  './zepto.js'
import  React  from 'react'
import './index.less'
import Card from 'antd-mobile/lib/card';
import WingBlank from 'antd-mobile/lib/wing-blank';
import WhiteSpace from 'antd-mobile/lib/white-space';
export default class MButton extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <WingBlank size="lg">
        <WhiteSpace size="lg" />
        <Card>
          <Card.Header
            title="This is title"
            thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
            extra={<span>this is extra</span>}
          />
          <Card.Body>
            <div className="button">This is content of `Card`</div>
          </Card.Body>
          <Card.Footer content="footer content" extra={<div>extra footer content</div>} />
        </Card>
        <WhiteSpace size="lg" />
      </WingBlank>
    )
  }
}
