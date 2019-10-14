import  React  from 'react'
import './index.less'
import  './styles.css'
import Input from './Button/index.jsx';
export default class Input extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <div className="input">
        <input></input>
      </div>
    )
  }
}
