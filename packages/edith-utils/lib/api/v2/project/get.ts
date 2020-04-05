
import { get } from '../../../request';
/**
 * 开户校验身份(域：basic)
 * @param parameters 
 */
export default async function getProject(projectName: string): Promise<ApiResponse<Array<ProjectFile>>> {
  return get(`/api/v2/project/${projectName}`);
}
