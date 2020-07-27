const monacoBase = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.18.1/min/vs';
const config = {
  urls: {
    monacoLoader: `${monacoBase}/loader.js`,
    monacoBase: monacoBase,
  },
  tsConfig: {
    
  }
}
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    console.log(label)
    if (label === 'json') {
      return `${monacoBase}/language/${label}/jsonWorker.js`;
    }
    if (label === 'css') {
      return `${monacoBase}/language/${label}/cssWorker.js`;
    }
    if (label === 'html') {
      return `${monacoBase}/language/${label}/htmlWorker.js`;
    }
    if (label === 'typescript' || label === 'javascript') {
      return `${monacoBase}/language/typescript/tsWorker.js`;
    }
    return `${monacoBase}/base/worker/workerMain.js`
   }
 }
export default config;