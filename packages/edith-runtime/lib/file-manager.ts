
const LocalStorage = {
  setItem: async (key: string, value) => {
    //Todo
    window.localStorage.setItem(key, value);
  },
  getItem: async (key: string) => {
    const res = window.localStorage.getItem(key);
    return res || null;
  }
}
interface IEngine {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => Promise<string | null>;
}
export default class FileManager {
  public static engine: IEngine = LocalStorage;

  static init() {

  }
  static async getFileContent(path: string): Promise<{
    code: string,
    fullPath: string
  }> {
    const res = await FileManager.engine.getItem(path);
    return {
      code: res,
      fullPath: path
    }
  }
  static async setFileContent(path: string, content: string) {
    await FileManager.engine.setItem(path, content)
  }
}