import { Component  } from 'react';
import eventBus from '@/utils/event'
import { toHTML } from '@/packages/jest/prettify'
import './prettify.less'
import Loading from '@/components/Loading'
export default class Test extends Component<any, any>{
  constructor(props) {
    super(props);
    this.state = {
      result: [],
      loading: true
    }
  }
  componentDidMount() {
    eventBus.on('jest-result', payload => {
      this.setState({
        loading: false
      })
      if(payload.result) {
        this.setState({
          result: payload.result
        })
      }
    })
  }
  render() {
    if(this.state.loading) {
      return <Loading></Loading>
    }
    return (
      <div className="jest-result-container">
        <div className="jest-lite-report" dangerouslySetInnerHTML={{__html: toHTML(this.state.result)}}></div>
      </div>
    )
  }
}