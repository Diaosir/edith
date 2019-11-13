import Transpiler from '../lib/transpiler/transpiler'
import ClientWebpack from '../index'
export default abstract class Plugin {
  public manager = Transpiler;
  public clientWebpack = ClientWebpack;
  constructor() {
  }
  abstract init(): void;
  abstract reset(): void;
}