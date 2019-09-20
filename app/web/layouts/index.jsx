import * as React from 'react';
import PropTypes from 'prop-types';
import withRouter from 'umi/withRouter';
import './index.scss'
@withRouter
export default class Layout extends React.PureComponent {
  state = {
    showTab: false,
  };
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
