import { Service } from 'egg';
const request = require('request');
const Base64 = require('js-base64').Base64;
const TOKEN = '43e06dbe8f481bfac885a16c6d2f9c4f3b87851a', GITLAB_API = 'https://api.github.com'
async function mRequest(options) {
  const url = typeof options === 'string' ? options : options.url;
  const result: {
    data?: any,
    status?: any
  } = await new Promise((resolve, reject) => {
    request({
      method: 'GET',
      json: true,
      headers: {
        'PRIVATE-TOKEN': TOKEN,
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
      },
      ...options,
      url: `${GITLAB_API}${url}`,
    }, (err,httpResponse,body) => {
      if(err) {
        reject(err);
      }
      const res = {
        data: body,
        status: httpResponse
      }
      resolve(res);
    })
  })
  return result;
}
export default class GitlabService extends Service {
  async getProjectsInfo(id): Promise<any> {
    const {data: data} = await mRequest({
      url: `/projects/${id}/repository/tree?ref=master`,
      method: 'GET'
    });
    return data;
  }
  /**
   * 获取 gitlab 文件夹列表
   * @param id
   * @param path
   */
  async getFileList(id, path): Promise<any> {
    const {data: data} = await mRequest({
      url: `/repos/Diaosir/edith/contents/${path}`,
      method: 'GET'
    });
    return data;
  }
   /**
   * 获取 gitlab 文件内容
   * @param id
   * @param path
   */
  async getFileInfo(id, path): Promise<any> {
    const {data: data} = await mRequest({
      url: `/repos/Diaosir/edith/contents/${decodeURIComponent(path)}/`,
      method: 'GET'
    });
    return Base64.decode(data.content);
  }
}