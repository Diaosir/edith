import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import path from 'path'
export default class Ast {
  public allPackages: Set<any> = new Set();
  constructor(code, options?: any) {
    this.allPackages = this.getAllPackages(code);
  }
  /**
   * parse code
   */
  protected getAst(code) {
    return parse(code, {
      sourceType: "module",
      plugins: [
        // enable jsx and flow syntax
        "jsx",
        "flow"
      ]
    });
  }
  /**
   * 获取代码中所有通过require和import引入的文件名称
   * @param code 
   */
  protected getAllPackages(code){
    let ast = null;
    try{
      ast = this.getAst(code);
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
  public  getNpmPackages() {
    const allPackages = Array.from(this.allPackages);
    return allPackages.filter((packageName: string) => {
      return path.parse(packageName).dir === '';
    })
  }
}