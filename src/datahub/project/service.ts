import request from 'edith-utils/lib/request';

import File, { FileType } from 'edith-types/lib/file'
const prefix = '/api/v2'
const typeToNumber = (fileType: FileType): number => {
  if(fileType === FileType.FOLDER) {
    return Number.NEGATIVE_INFINITY;
  } else {
    return 1;
  }
}
export default class ProjectServie{
  static getProjectFileList(projectId: number, name: string) {
    return request(`${prefix}/project/${name}`).then(({ data }) => {
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
}