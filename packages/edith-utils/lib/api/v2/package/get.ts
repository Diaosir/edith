
import { get } from '../../../request';
/**
 * 开户校验身份(域：basic)
 * @param parameters 
 */
export default async function getPackage(devStr): Promise<ApiResponse<ResponseOfCombinations>> {
  return get(`/api/v2/package/${encodeURIComponent(devStr)}`);
}
