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
      error: null, 
      loading: true
    }
  }
  componentDidMount() {
    eventBus.on('jest-result', payload => {
      console.log(payload)
      this.setState({
        loading: false
      })
      this.setState({
        result: payload.result,
        error: payload.error
      })
    })
  }
  render() {
    const { error, result, loading} = this.state;
    if(loading) {
      return <Loading></Loading>
    }
    return (
      <div className="jest-result-container">
        {
          error ? (
            <div className="jest-lite-report">
              <div className="jest-lite-report__errors">
                {
                  `${error.stack}`
                }
              </div>
            </div>
          ) : (
            <div className="jest-lite-report" dangerouslySetInnerHTML={{__html: toHTML(result) }}></div>
          )
        }
      </div>
    )
  }
}