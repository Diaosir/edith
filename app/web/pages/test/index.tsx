import { Component } from 'react';
import MonacoEditor from '@/components/Monaco'
export default class App extends Component {
  render(){
    return (
      <div>
        <MonacoEditor 
          height='400px'

          value="import a from './'"
          filename='/test/index.ts'
          language='typescript'
        />
      </div>
    )
  }
}