import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
interface MyTheme {
  background: string;
  boxShadow: string;
}
const useStyles = makeStyles((theme: MyTheme) => createStyles(
  {
    root: {
      background: theme.background || '#2b2e41',
      border: 0,
      borderRadius: 10,
      boxShadow: theme.boxShadow || '0 3px 5px 2px rgba(43, 46, 65, .3)',
      color: 'white',
      height: 670,
      width: 375
    },
    header: {
      height: 45
    },
    content: {
      
    },
    contentIframe: {
      width: '100%',
      height: 625,
      border: 'none'
    }
  }
));

export default function PreviewBox(props: any) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.header}></div>
      <div className={classes.content}>
        <iframe className={classes.contentIframe} src='https://wx-sit.zhaocaiwa.com/'></iframe>
      </div>
    </div>
  )
}