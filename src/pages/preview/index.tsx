import { Component } from 'react'
import './index.scss'
import { connect } from 'dva';
import ProjectService from '@/datahub/project/service';

interface Props {
    dispatch: Function;
    location: any
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
        const { location: { query }} = this.props;
        query.name && this.props.dispatch({
            type: 'preview/getProjectFileList',
            payload: { projectId: 4260, name: query.name || 'test'}
        })
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