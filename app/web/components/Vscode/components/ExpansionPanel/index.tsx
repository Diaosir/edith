import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    panel: {
      background: "inherit",
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    summary: {
      color: '#fff',
      height: '33px !important',
      minHeight: '33px !important',
      padding: '0 8px',
      background: "#2e3133",
      margin: '0 !important'
    },
    details: {
      padding: '0'
    },
    icon: {
      color: '#fff'
    },
    expanded: {
      // height: '30px',
      // minHeight: '30px !important',
      // margin: '0 !important'
    },
    rigthElement: {
      position: 'absolute',
      right: 0
    }
  }),
);
export default function SimpleExpansionPanel(props: any) {
  const classes = useStyles({});
  const { rigthElement } = props;
  return (
    <div className={classes.root}>
      <ExpansionPanel 
        className={classes.panel}
        >
        <ExpansionPanelSummary
          expandIcon={!rigthElement ? <ExpandMoreIcon className={classes.icon}/> : null}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className={classes.summary}
          classes={{
            expanded: classes.expanded
          }}
        >
          <Typography className={classes.heading}>        {props.title} 
            </Typography>
          <div className={classes.rigthElement}>
            {rigthElement}
          </div>

        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          {props.children}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
