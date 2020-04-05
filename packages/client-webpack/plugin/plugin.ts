import Manager from '../lib/manager'
import ClientWebpack from '../index'
export default abstract class Plugin {
  public manager = Manager;
  public clientWebpack = ClientWebpack;
  constructor() {
  }
  abstract init(): void;
  abstract reset(): void;
}