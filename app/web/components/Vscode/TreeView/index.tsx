import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import DeleteIcon from '@material-ui/icons/Delete';
import Label from '@material-ui/icons/Label';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import InfoIcon from '@material-ui/icons/Info';
import ForumIcon from '@material-ui/icons/Forum';
import DescriptionIcon from '@material-ui/icons/Description';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Folder from '@material-ui/icons/Folder';
import FolderOpen from '@material-ui/icons/FolderOpen';
import StyledTreeItem from './TreeItem'
import File from '@/datahub/project/entities/file'
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

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
  fileList: Array<File>;
}
function TreeViewChildren(fileList: Array<File>) {
  return (
    <>
      {
        fileList.length > 0 && fileList.map((file) => {
          if (file.children.length > 0) {
            return (
              <StyledTreeItem key={file.fid} nodeId={`${file.fid}`} labelText={`${file.name}`} labelIcon={Folder}>
                {
                  TreeViewChildren(file.children)
                }
              </StyledTreeItem>
            )
          }
          return (
            <StyledTreeItem key={file.fid} nodeId={`${file.fid}`} labelText={`${file.name}`} labelIcon={ArrowRightIcon} />
          )
        })
      }
    </>
  )
}
export default function MTreeView(props: TreeViewProps) {
  const classes = useStyles({});
  const { fileList } = props;
  return (
    <TreeView
      className={classes.root}
      defaultExpanded={['3']}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 15 }} />}
    >
      {
        TreeViewChildren(fileList)
      }
      {/* <StyledTreeItem nodeId="1" labelText="All Mail" labelIcon={FolderOpen} />
      <StyledTreeItem nodeId="2" labelText="Trash" labelIcon={DeleteIcon} />
      <StyledTreeItem nodeId="3" labelText="Categories" labelIcon={Folder}>
        <StyledTreeItem
          nodeId="5"
          labelText="Social"
          labelIcon={SupervisorAccountIcon}
          labelInfo="90"
          color="#1a73e8"
          bgColor="#e8f0fe"
        />
        <StyledTreeItem
          nodeId="6"
          labelText="Updates"
          labelIcon={InfoIcon}
          labelInfo="2,294"
          color="#e3742f"
          bgColor="#fcefe3"
        />
        <StyledTreeItem
          nodeId="7"
          labelText="Forums"
          labelIcon={ForumIcon}
          labelInfo="3,566"
          color="#a250f5"
          bgColor="#f3e8fd"
        />
        <StyledTreeItem
          nodeId="8"
          labelText="Promotions"
          labelIcon={LocalOfferIcon}
          labelInfo="733"
          color="#3c8039"
          bgColor="#e6f4ea"
        />
      </StyledTreeItem>
      <StyledTreeItem nodeId="4" labelText="History" labelIcon={Label} /> */}
    </TreeView>
  );
}
