import vscodeManager from '@/packages/vscode'
import './index.scss'
/**
 * document: ./documents/vscode.ejs
 */
import { Component } from 'react'
export default class Vscode extends Component {
  componentDidMount() {
    vscodeManager.initLoader()
  }
  render() {
    return (
      <div id="vscode-container">
      </div>
    )
  }
}