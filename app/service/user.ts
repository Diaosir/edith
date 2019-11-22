import { Service } from 'egg';
export default class UserService extends Service {
  async find() {
    const result = await this.ctx.model.User.find();
    return result;
  }

}