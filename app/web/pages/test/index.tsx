import { Component } from 'react';
import MonacoEditor from '@/components/Monaco'
export default class App extends Component {
  render(){
    return (
      <div>
        <MonacoEditor 
          value='var a = 1'
          filename='/test/index.ts'
          language='typescript'
        />
      </div>
    )
  }
}