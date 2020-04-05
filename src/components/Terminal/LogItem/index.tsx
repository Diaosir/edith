import Log from '@/datahub/console/entities/log'
import * as is from 'is'
import ReactJson from 'react-json-view';
import './index.scss'
interface Props {
  log: Log
}
function renderLogData(data: any) {
  if(is.object(data)) {
    return (
      <div className='log-data'>
        <ReactJson 
          src={data} 
          name={false}
          style={{fontSize: 12}}/>
      </div>
    )
  }
  return (
    <div className='log-data'>
      {data}
    </div>
  )
}
export default function LogItem(props: Props) {
  const { log } = props;
  return (
    <div>
      {renderLogData(log.data)}
    </div>
  )
}