import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Folder from '@material-ui/icons/Folder';
import FolderOpen from '@material-ui/icons/FolderOpen';
import StyledTreeItem from './TreeItem'
import File, { FileType } from 'edith-types/lib/file'
import './index.scss'
import Controller from './controller'
import * as polished from 'polished';
const typeToNumber = (fileType: FileType): number => {
  if(fileType === FileType.FOLDER) {
    return Number.NEGATIVE_INFINITY;
  } else {
    return 1;
  }
}
const useStyles = makeStyles(
  createStyles({
    root: {
      flexGrow: 1,
      maxWidth: 400
    },
  }),
);
interface TreeViewProps {
  fileList?: Array<File>;
  dispatch: Function;
  activeFileId: number;
}
function getFileIcon(name) {
  return function(props) {
    return (
      <span className={props.className} style={{background: `url(https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@master/icons/${name == 'scss' ? 'sass' : name}.svg)`, ...props.styles}}></span>
    );
  }
}

export default function MTreeView(props: TreeViewProps) {
  const classes = useStyles({});
  const [expandedNodeList, setExpandedNodeList] = useState([]);
  const { fileList, dispatch, activeFileId } = props;
  function handleFileClick(file: File) {
    dispatch({
      type: 'menuFileClickEvent',
      payload: file
    })
  }
  function onNodeToggle(nodeId, expanded) {
    let newList = expandedNodeList;
    if(expandedNodeList.includes(nodeId) && !expanded) {
      newList = expandedNodeList.filter( id => id !== nodeId)
    }
    if(!expandedNodeList.includes(nodeId) && expanded) {
      newList = [].concat(expandedNodeList, [nodeId]);
    }
    setExpandedNodeList(newList);
  }
  function TreeViewChildren(fileList: Array<File>) {
    const list = fileList.sort(function(a, b) {
      return typeToNumber(a.type) - typeToNumber(b.type)
    })
    return (
      <>
        {
          list.length > 0 && list.map((file) => {
            const { background } = file.getColorObject();
            if (file.children.length > 0) {
              return (
                <StyledTreeItem
                   key={file.fid} 
                   nodeId={`${file.fid}`} 
                   labelText={`${file.name}`} 
                   bgColor={`${polished.rgbToColorString(background)}`}
                   labelIcon={expandedNodeList.includes(`${file.fid}`) ? FolderOpen : Folder}>
                  {
                    TreeViewChildren(file.children)
                  }
                </StyledTreeItem>
              )
            }
            return (
              <StyledTreeItem 
                key={file.fid} 
                nodeId={`${file.fid}`} 
                labelText={`${file.name}`} 
                labelIcon={getFileIcon(file.getIconName())} 
                bgColor={`${polished.rgbToColorString(background)}`}
                onClick={() => { handleFileClick(file) }}
                isActive={ file.fid === activeFileId }
                />
            )
          })
        }
      </>
    )
  }
  function handleAddFile() {
    dispatch({
      type: 'addFile',
      payload: {
        fid: activeFileId
      }
    })
  }
  function handleAddFolder() {
    dispatch({
      type: 'addFolder',
      payload: {
        fid: activeFileId
      }
    })
  }
  return (
    <div className="menu-tree">
      {/* <Controller 
        onAddFile={handleAddFile}
        onAddFolder={handleAddFolder}
      /> */}
      <TreeView
        className={classes.root}
        defaultExpanded={['3']}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        onNodeToggle={onNodeToggle}
        defaultEndIcon={<div style={{ width: 15 }} />}
      >
        {
          TreeViewChildren(fileList)
        }
      </TreeView>
    </div>
  );
}