import Transpiler from '@/packages/client-webpack/lib/transpiler/transpiler';
export default function({types: BabelTypes}, options) {
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
                      path.node.arguments = [BabelTypes.stringLiteral(Transpiler.getDenpenciesIdMapValue(options.path, arg.value))]
                  }
              }
          }
      }
    };
}