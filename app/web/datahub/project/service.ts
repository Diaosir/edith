import request from '../../utils/request';
import { stringify } from 'qs';
import File, { FileType } from './entities/file'
const prefix = '/api'
export default class ProjectServie{
  static getProjectFileList(projectId: number, path: string) {
    return request(`${prefix}/project/${projectId}/tree`, {
      method: 'POST',
      body: JSON.stringify({
        path
      })
    }).then(({ data }) => {
      let fileList = File.generateFileList(data.payload)
      return fileList
    })
  }
  
  static getProjectFileContent(projectId: number, path: string) {
    return request(`${prefix}/project/${projectId}/file`, {
      method: 'POST',
      body: JSON.stringify({
        path
      })
    }).then(({ data }) => {
      if (data.code == 200) {
        return data.payload
      }
      return ''
    })
  }
}