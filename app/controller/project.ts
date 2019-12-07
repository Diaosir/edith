import { Controller } from 'egg';

export default class ProjectController extends Controller {
  public async add(ctx) {

    // const { name } = this.ctx.request.body;
    // const { id } = this.ctx.params;
    // const data = await ctx.service.filesystem.getFileList(name || 'test');

    console.log(this.ctx.request.body)
    const result = await ctx.service.user.add();
    ctx.body = result
  }

  public async find(ctx) {
    const result = await ctx.service.project.find({});
    ctx.body = result
  }
}