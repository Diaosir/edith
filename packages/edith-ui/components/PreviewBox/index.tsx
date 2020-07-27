import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Draggable from 'react-draggable';
// import Moveable from "react-moveable";
import eventBus from 'edith-utils/lib/eventemitter'
import { useDidMount, useUnMount } from 'edith-utils/lib/life-cycle'
console.log(eventBus)
import { iPhone7 } from './device';
interface MyTheme {
  background: string;
  boxShadow: string;
  src?: string;
  isPortal?: Boolean;
}
const useStyles = makeStyles((theme: MyTheme) => createStyles(
  {
    root: {
      background: theme.background || '#2b2e41',
      border: 0,
      borderRadius: 10,
      boxShadow: theme.boxShadow || '0 3px 5px 2px rgba(43, 46, 65, .3)',
      color: 'white',
      height: 500,
      width: 375,
      position: 'relative',
      zIndex: 1000
    },
    header: {
      height: 45
    },
    content: {
      
    },
    contentIframe: {
      width: '100%',
      height: 455,
      border: 'none'
    }
  }
));
export default function PreviewBox(props: any) {
  const classes = useStyles();
  const iframeRef = useRef<any>(null)
  const el = useRef<any>(null);
  useDidMount(() => {
    var contentWindow = iframeRef.current.contentWindow || iframeRef.current.contentDocument;
    setUa(contentWindow)
    contentWindow.onload = () => {

    }
  })
  useState(() => {
    el.current = document.createElement('div');
    document.body.appendChild(el.current);
  });
  useUnMount(() => {
    document.body.removeChild(el.current);
  })
  function setUa(contentWindow: Window) {
    Object.defineProperty(contentWindow.navigator, 'userAgent', {
      configurable: true,
      get: () => iPhone7.ua
    })
    console.log(contentWindow.navigator.userAgent)
  }
  function reload() {
    var contentWindow = iframeRef.current.contentWindow || iframeRef.current.contentDocument;
    contentWindow.reload();
  }
  return createPortal(
    <Draggable
      handle={`.${classes.header}`}
      bounds={'html'}
    >
      <div className={classes.root}>
        <div className={classes.header}>
          <div onClick={reload}>reload</div>
        </div>
        <div className={classes.content}>
          <iframe ref={iframeRef} className={classes.contentIframe} src='http://localhost:8000/preview?name=drag'></iframe>
        </div>
      </div>
    </Draggable>
    ,el.current)
}