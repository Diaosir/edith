// import * as babel from '@babel/standalone';
// import ReplaceRequire from './plugins/replace-require'
self.importScripts('https://unpkg.com/@babel/standalone@7.6.4/babel.min.js');
const ctx = self
ctx.addEventListener("message", (event ) => {
  const { data } = event;
  if (data && data.type === 'babel-translate') {
    translate(data.payload.code, data.payload.path);
  }
});
// Post data to parent thread

// Respond to message from parent thread
function replaceRequire(denpencies) {
  return ({types: BabelTypes}, options) => {
    return {
      visitor: {
          ImportDeclaration(path, state) {
              // console.log(path)
          },
          CallExpression(path, state) {
              const { node: { callee, arguments: args }} = path;
              if (callee.type === "Identifier" && callee.name === 'require') {
                  path.node.callee = BabelTypes.identifier("__edith_require__");
                  const arg = args[0];
                  if (args.length === 1) {
                      if (!/^!!root\//.exec(args[0])) {
                        path.node.arguments = [BabelTypes.stringLiteral(`${options.path}/${arg.value}`)];
                      } 
                      denpencies.push(arg.value);
                  }
              }
          }
      }
    };
  }
}
function translate(code, filepath) {
  let denpencies = []
  try{
    const transformResult = ctx.Babel.transform(code || '', {
        presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
        plugins: [[replaceRequire(denpencies), { path: filepath}]]
    });
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
    console.log(code)
    ctx.postMessage({
      type: `error`,
      error: error.toString()
    })
  }
}
ctx.postMessage({
  type: 'ready'
})