
const global = window as {[key: string]: any};
export async function init() {
  if (global.monaco && global.monaco.editor) {
    return global.monaco;
  }
  
}