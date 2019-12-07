import { Service } from 'egg';
export default class projectService extends Service {
  async find() {
    const result = await this.ctx.model.Project.find();
    return result;
  }
  async add() {
    const result = await this.ctx.model.Project.add();
    return result;
  }
}