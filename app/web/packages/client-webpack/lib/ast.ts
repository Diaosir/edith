import * as babylon from 'babylon'
import traverse from '@babel/traverse';
import path from 'path'
export default class Ast {
  protected code: string;
  constructor(code, options?: any) {
    this.code = code;
  }
  /**
   * parse code
   */
  public static parse(code) {
    return babylon.parse(code, {
      sourceType: "module",
      plugins: [
        // enable jsx and flow syntax
        "jsx",
        "flow",
        'css'
      ]
    });
  }
  /**
   * 获取代码中所有通过require和import引入的文件名称
   * @param code 
   */
  public static getAllPackages(code: string){
    let ast = null;
    try{
      ast = Ast.parse(code);
    } catch(error) {
      return new Set()
    }
    let packages = new Set()
    traverse(ast, {
      ImportDeclaration: function(nodePath) {
        // console.log(nodePath)
        const { node: { source } } = nodePath;
        if ( source.type === 'StringLiteral' && !!source.value) {
          packages.add(source.value);
        }
      },
      CallExpression: function(nodePath) {
        const { node: { callee, arguments: args }} = nodePath;
        if (callee.type === "Identifier" && callee.name === 'require' && args.length > 0) {
          const arg: any = args[0];
          packages.add(arg.value)
        }
      }
    })
    return packages;
  }
  /**
   * 获取代码中所有通过require和import引入的npm包名称
   * @param code 
   */
  public static getNpmPackages(code: string) {
    const allPackages = Array.from(Ast.getAllPackages(code));
    return allPackages.filter((packageName: string) => {
      return path.parse(packageName).dir === '';
    })
  }
}