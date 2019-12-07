import { Controller } from 'egg';
export default class HomeController extends Controller {
  async index() {
    await this.ctx.render('index.html');
  }
  async vscode() {
    await this.ctx.render('vscode.html');
  }
  async api() {
    const ctx = this.ctx;
    console.log(ctx.path, 'path')
    // const url = 'https://h5.ele.me' + ctx.path.replace(/^\/api/, '') + '?' + ctx.querystring;

    console.log(ctx.service, '-----');
    // const res = await this.ctx.curl(this.ctx.path, {
    //   method: this.ctx.method,
    // });

    // ctx.body = res.data;
    // ctx.status = res.status;
  }
  async getVscodeExtensionsConfig(ctx) {
    const config = await ctx.service.vscode.getExtensionsConfig();

    ctx.body = {
      code: 200,
      payload: config
    }
  }
  async getExtension(ctx) {
    const { extensionName } = ctx.params;
    console.log(extensionName);
    ctx.body = {
      extensionName
    }
  }
}