import { Service } from 'egg';
const request = require('request');
const Base64 = require('js-base64').Base64;
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
      url: `/projects/${id}/repository/tree?path=${path}&ref=master`,
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
      url: `/projects/${id}/repository/files/${decodeURIComponent(path)}?ref=master`,
      method: 'GET'
    });
    return Base64.decode(data.content);
  }
}