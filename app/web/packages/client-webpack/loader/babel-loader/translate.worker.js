// import * as babel from '@babel/standalone';
import ReplaceRequire from './plugins/replace-require'
self.importScripts('https://unpkg.com/@babel/standalone@7.6.4/babel.min.js');
const ctx = self
ctx.addEventListener("message", (event ) => {
  const { data } = event;
  if (data && data.type === 'babel-translate') {
    translate(data.payload.code, data.payload.path, data.payload.babelOptions);
  }
});
// Post data to parent thread

// Respond to message from parent thread
function translate(code, filepath, babelOptions) {
  let denpencies = [];
  const options = {
    presets: [].concat(babelOptions.presets, []),
    plugins: [].concat(babelOptions.plugins, [[ReplaceRequire(denpencies), { path: filepath}]])
  }
  try{
    const transformResult = ctx.Babel.transform(code || '', options);
    ctx.postMessage({
      type: `success`,
      payload: {
        path: filepath,
        code: transformResult.code,
        denpencies: denpencies,
        isError: false
      }
    })
  } catch(error) {
    console.log(error)
    ctx.postMessage({
      type: `error`,
      error: error.toString()
    })
  }
}


ctx.postMessage({
  type: 'ready'
})