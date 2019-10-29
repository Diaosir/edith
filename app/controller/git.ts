import { Controller } from 'egg';
export default class HomeController extends Controller {
  async index() {
    await this.ctx.render('index.html');
  }
  async getProject() {
    const ctx = this.ctx;
    const { name } = this.ctx.request.body;
    const { id } = this.ctx.params;
    const data = await ctx.service.filesystem.getFileList(name || 'test');
    ctx.body = {
      code: 200,
      payload: data,
      message: 'success'
    }
  }
  async fileContent() {
    const ctx = this.ctx;
    const { path } = this.ctx.request.body;
    const { id } = this.ctx.params;
    const data = await ctx.service.gitlab.getFileInfo(id, path);
    ctx.body = {
      code: 200,
      payload: data,
      message: 'success'
    }
  }
}