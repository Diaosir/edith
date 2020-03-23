const globalWindow = window as {[key: string]: any};

export function initializeRequires() {
  globalWindow.require.define('electron', [], () => {
    return {
      webFrame: {
        getZoomFactor() {
          return 1;
        },
      },
      clipboard: {
        writeText: (text: string) => {
          // @ts-ignore
          return navigator.clipboard.writeText(text);
        },
        readText: () => {
          // @ts-ignore
          return navigator.clipboard.readText();
        },
      },
    };
  });
}