import { Component } from 'react'
import './index.scss'
import { connect } from 'dva';
import ProjectService from '@/datahub/project/service';

interface Props {
    dispatch: Function;
  }
@connect(({ preview, loading}) => ({
    preview,
    loading: loading
  }))
export default class PreviewPage extends Component<Props, any> {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        window.addEventListener('message', ({data}) => {
            this.props.dispatch({
                type: 'preview/onMessage',
                payload: data
            })
        }, false)
    }
    render() {
        return (
            <>
                <div className="preview-page" id="app">
                </div>
            </>
        )
    }
}