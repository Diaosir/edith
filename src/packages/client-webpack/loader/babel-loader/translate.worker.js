import * as babel from '@babel/standalone';
import ReplaceRequire from './plugins/replace-require'
// self.importScripts('https://unpkg.com/@babel/standalone@7.6.4/babel.min.js');
const defaultGlobals = {
  process: {
    env: {
      NODE_ENV: "production"
    }
  }
}
function require(){
  return {};
}
function preEval(path, code) {
  let module = {
    exports: {}
  }
  const allGlobals = {
    module,
    require,
    exports: {},
    ...defaultGlobals
  }
  const allGlobalKeys = Object.keys(allGlobals);
  const globalsCode = allGlobalKeys.length ? allGlobalKeys.join(', ') : '';
  const globalsValues = allGlobalKeys.map(k => allGlobals[k]);
  try{
    const newCode = `(function evaluate(` + globalsCode + `) {` + code + `\n})`;
    (0, eval)(`${newCode} \n //# sourceURL=edith:${path}?`).apply(null, globalsValues);
  } catch(error){
      throw error
  }
}
const ctx = self
ctx.Babel = babel
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
    const now = Date.now()
    const transformResult = ctx.Babel.transform(code || '', options);
    console.log(`babel worker 编译${filepath}耗时：${(Date.now() - now) / 1000}s`)
    ctx.postMessage({
      type: `success`,
      payload: {
        path: filepath,
        code: transformResult.code,
        denpencies: denpencies,
        isError: false,
        translateTime: Date.now() - now
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
// ctx.postMessage({
//   type: 'ready'
// })