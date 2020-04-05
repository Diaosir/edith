export default function replaceRequire(denpencies) {
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