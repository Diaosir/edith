import { Controller } from 'egg';

export default class UserController extends Controller {
  public async add(ctx) {
    // const result = await ctx.service.user.add();
    // ctx.body = result

    console.log(this.ctx.request.body, 8888)
    const result = await ctx.service.user.add();
    ctx.body = result
  }

  public async find(ctx) {
    const result = await ctx.service.user.find({});
    ctx.body = result
  }


}