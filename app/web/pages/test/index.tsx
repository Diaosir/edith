import { Component } from 'react';
import Terminal from '@/components/Terminal'

export default class App extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    return (
      <div>
        <Terminal 
        />
      </div>
    )
  }
}