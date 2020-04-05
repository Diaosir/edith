import React, { Component } from 'react';
import TreeView from './TreeView'
import './index.scss'
import MonacoEditor from '@/components/Monaco'
import Log, { LogType } from '@/datahub/console/entities/log'
import LogItem from './LogItem'

interface State {
  messages: Array<Log>;
  codeList: Array<string>;
}
export default class ReactTerminal extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      messages: [
        new Log({
          type: LogType.DEFAULT,
          data: {
            a: '1'
          }
        }),
        new Log({
          type: LogType.DEFAULT,
          data: {
            b: '1'
          }
        }),
        new Log({
          type: LogType.DEFAULT,
          data: '1111'
        })
      ],
      codeList: [
        'a'
      ]
    }
  }
  onEditorChange = (value) => {

  }
  render() {
    const { messages } = this.state
    return (
      <div className="console-container">
        <div className="console-tree">

        </div>
        <div className="console-terminal">
          <div className="console-output">
            {
              messages.map((log) => {
                return (
                  <LogItem key={`${log.id}`} log={log}/>
                )
              })
            }
          </div>
          <MonacoEditor
            value='console.log(1)'
            theme="ligth"
            language="javascript"
            onChange={this.onEditorChange}
            filename='/console.js'
          />
        </div>
      </div>
    );
  }
}
