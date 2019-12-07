import request from '../../utils/request';

import File, { FileType } from './entities/file'
const prefix = '/api'
const typeToNumber = (fileType: FileType): number => {
  if(fileType === FileType.FOLDER) {
    return Number.NEGATIVE_INFINITY;
  } else {
    return 1;
  }
}
export default class ProjectServie{
  static getProjectFileList(projectId: number, name: string) {
    return request(`${prefix}/project/${projectId}/tree`, {
      method: 'POST',
      body: JSON.stringify({
        name
      })
    }).then(({ data }) => {
      let fileList = File.generateFileList(data.payload)
      return fileList.sort(function(a, b) {
        return typeToNumber(a.type) - typeToNumber(b.type)
      })
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

  static addProject(param: object) {
    console.log(param, 'service')
    return request(`/api/user`, {
      method: 'POST',
      body: JSON.stringify(param)
    }).then(({ data }) => {
      if (data.code == 200) {
        return data.payload
      }
      return ''
    })
  }
}