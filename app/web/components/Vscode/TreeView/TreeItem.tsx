import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import Typography from '@material-ui/core/Typography';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
declare module 'csstype' {
  interface Properties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<any>;
  labelInfo?: string;
  labelText: string;
};

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.text.primary,
      '&:focus > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
        color: 'var(--tree-view-color)',
      },
    },
    content: {
      height: 32,
      color: theme.palette.text.secondary,
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      marginLeft: 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    label: {
      fontWeight: 'inherit',
      color: 'rgba(255, 255, 255, 0.5)',
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
      width: 16,
      height: 16
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

export default function StyledTreeItem(props: StyledTreeItemProps) {
  const classes = useTreeItemStyles({});
  const { labelText, labelIcon: LabelIcon, labelInfo, color = '#fff', bgColor, ...other } = props;
  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon 
            color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}