import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Folder from '@material-ui/icons/Folder';
import StyledTreeItem from './TreeItem'
import Log from '@/datahub/console/entities/log'

const useStyles = makeStyles(
  createStyles({
    root: {
      height: 264,
      flexGrow: 1,
      maxWidth: 400,
    },
  }),
);
interface TreeViewProps {
  treeData: Array<any>;
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
  const { treeData } = props;
  function TreeViewChildren(treeData: Array<File>) {
    return (
      <>
        {
          treeData.length > 0 && treeData.map((tree: any) => {
            if (tree.children.length > 0) {
              return (
                <StyledTreeItem
                   key={tree.id} 
                   nodeId={`${tree.id}`} 
                   labelText={`${tree.name}`}
                   labelIcon={Folder}>
                  {
                    TreeViewChildren(tree.children)
                  }
                </StyledTreeItem>
              )
            }
            return (
              <StyledTreeItem 
                key={tree.id} 
                nodeId={`${tree.id}`} 
                labelText={`${tree.name}`} 
                />
            )
          })
        }
      </>
    )
  }
  return (
    <TreeView
      className={classes.root}
      defaultExpanded={['3']}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      // onNodeToggle={onNodeToggle}
      defaultEndIcon={<div style={{ width: 15 }} />}
    >
      {
        TreeViewChildren(treeData)
      }
    </TreeView>
  );
}
