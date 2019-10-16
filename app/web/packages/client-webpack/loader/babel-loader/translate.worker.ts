// import * as babel from '@babel/standalone';
// import ReplaceRequire from './plugins/replace-require'
self.importScripts('https://unpkg.com/@babel/standalone@7.6.4/babel.min.js');
const ctx: Worker = self as any;
ctx.addEventListener("message", (event: MessageEvent) => {
  const { data } = event;
  if (data && data.type === 'babel-translate') {
    translate(data.payload.code, data.payload.path, data.payload.childrenDenpenciesMap);
  }
});

// Post data to parent thread

// Respond to message from parent thread
function replaceRequire({types: BabelTypes}, options) {
  return {
    visitor: {
        ImportDeclaration(path, state) {
            // console.log(path)
        },
        CallExpression(path, state) {
            const { node: { callee, arguments: args }} = path;
            if (callee.type === "Identifier" && callee.name === 'require') {
                path.node.callee = BabelTypes.identifier("__edith_require__");
                if (args.length === 1) {
                    const arg: any = args[0];
                    path.node.arguments = [BabelTypes.stringLiteral(options.childrenDenpenciesMap.get(`${options.path}/${arg.value}`))]
                }
            }
        }
    }
  };
}
function translate(code: string, filepath: string, childrenDenpenciesMap: Map<string, string>) {
  try{
    const transformResult = ctx.Babel.transform(code || '', {
        presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
        plugins: [[replaceRequire, {path: filepath, childrenDenpenciesMap: childrenDenpenciesMap}]]
    });
    ctx.postMessage({
      type: `translate-${filepath}-result`,
      payload: {
        filepath,
        result: transformResult.code,
        isError: false
      }
    })
  } catch(error) {
    console.log(error, filepath)
    ctx.postMessage({
      type: `translate-${filepath}-result`,
      payload: {
        path: filepath,
        result: error,
        isError: true
      }
    })
  }
}