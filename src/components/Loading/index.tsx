import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactDOM from 'react-dom'
import './index.scss'
let containerDOM = null, containerElement = null;
export default class Index extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }
  close() {
    containerDOM && document.body.removeChild(containerDOM);
    containerDOM = null;
    containerElement = null;
  }
  handleOverlayClick() {
    this.close();
  }
  handleClickConfirm(){
    const { onClickConfirm} = this.props;
    typeof onClickConfirm === 'function' && onClickConfirm();
    this.close();
  }
  handleClickCancel(){
    const { onClickCancel} = this.props;
    typeof onClickCancel === 'function' && onClickCancel()
    this.close();
  }
  render() {
    return(
      <div className="loading">
        <CircularProgress color="secondary" />
      </div>
    )
  }
}
export function close() {
  containerDOM && document.body.removeChild(containerDOM);
  containerDOM = null;
  containerElement = null;
}
export function show() {
  if (!containerDOM) {
    containerDOM = document.createElement('div');
    containerDOM.className = 'loading-container';
    document.body.appendChild(containerDOM);
  }
  containerElement = ReactDOM.render(<Index />, containerDOM);
}
