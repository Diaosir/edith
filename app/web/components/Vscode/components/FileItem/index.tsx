import { Component, createRef } from 'react'
import { File, FileType } from '../../../../../interface/File';
import './index.scss'
import Icon from '../../../../components/icons'
import * as polished from 'polished';
import Controller from './controller'
interface FileItemProps{
  data: File;
  level: number;
  onClick?: Function;
  [key: string]: any
}
interface FileItemState {
  data: File;
  [key: string]: any
}
export default class FileItem extends Component<FileItemProps, FileItemState> {
  public nameInputValue: string = '';
  public inputRef: any = null;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      hover: false,
      data: props.data
    }
    this.inputRef = createRef();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.data !== nextProps.data) {
      return {
        data: nextProps.data
      }
    }
    return null;
  }
  handleAddFolder = () => {
    const { dispatch, data: data} = this.props;
    dispatch({
      type: 'addFolder',
      payload: data
    })
  }
  handleDetele = () => {
    const { dispatch, data } = this.props;
    dispatch({
      type: 'deleteFile',
      payload: data
    })
  }
  handleAddFile = () => {
    const { dispatch, data } = this.props;
    dispatch({
      type: 'addFile',
      payload: data
    })
  }
  handleEdit = () => {
    const { dispatch, data } = this.props;
    dispatch({
      type: 'editFile',
      payload: data
    })
  }
  handleClick = () => {
    const { onClick } = this.props;
    typeof onClick === 'function' && onClick()
  }
  handleEditInputChange(value) {
    this.nameInputValue = value;
  }
  handleBlur() {
    const { dispatch, data } = this.props;
    dispatch({
      type: 'renameFile',
      payload: {
        fid: data.fid,
        name: this.nameInputValue
      }
    })
  }
  componentDidUpdate() {
    const {data: { isEdit }} = this.state;
    if (isEdit) {
      this.inputRef.current.focus();
    }
  }
  render() {
    const { level } = this.props;
    const {data: {name, type, isOpenChildren, active, isEdit }, data} = this.state;
    const { background, borderLeftColor } = data.getColorObject();
    const hoverBackgroundColor = data.getDefaultHoverBackground();
    let hoverStyles = this.state.hover ? {
      background: `${polished.rgbToColorString(hoverBackgroundColor)}`,
      borderColor: `${polished.rgbToColorString({
        ...borderLeftColor,
        alpha: borderLeftColor.alpha * 0.8
      })}`
    } : {}
    let clickStyles = (active && type !== FileType.FOLDER )? {
      background: `${polished.rgbToColorString(background)}`,
      borderColor: `${polished.rgbToColorString(borderLeftColor)}`
    } : {};
    return (
      <div className={`file-item file-type-${type} ${active ? 'active' : ''}`}
        style={{
          ...hoverStyles,
          ...clickStyles,
          paddingLeft: `calc(${level + 1}rem - 2px)`
        }} 
        onClick={this.handleClick} 
        onMouseEnter={() => { this.setState({hover: true}) }}
        onMouseLeave={() => { this.setState({hover: false}) }}
        >
        {
          type === FileType.FOLDER ? (
            <span className="file-icon">
              <Icon type={isOpenChildren ? data.getOpenIconName() : data.getIconName()}></Icon>
            </span>
          ) : (
            <span className="file-icon" style={{background: `url(https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@master/icons/${data.getIconName()}.svg)`, marginTop: 4}}></span>
          )
        }
        <div className="file-title-container">
          {
            isEdit ? (
              <input 
                className="file-title-input"
                ref={this.inputRef} 
                defaultValue={name} 
                onChange={(e) => this.handleEditInputChange(e.target.value)}
                onBlur={e => this.handleBlur()}
                />
            ) : name
          }
        </div>
        {
          (!isEdit && this.state.hover) && <Controller type={type} onEdit={this.handleEdit} onAddFile={this.handleAddFile} onAddFolder={this.handleAddFolder} onDelete={this.handleDetele}/>
        }
        
      </div>
    )
  }
}