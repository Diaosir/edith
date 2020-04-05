
import { get } from '../../../request';
/**
 * 开户校验身份(域：basic)
 * @param parameters 
 */
export default async function combinations(dependencies: CombinationsParamters): Promise<ApiResponse<ResponseOfCombinations>> {
  const devStr = Object.keys(dependencies).reduce((preValue, curValue) => {
    return `${preValue ? preValue + '+': ''}${curValue}@${dependencies[curValue]}`
  }, '')
  return get(`/api/v2/package/combinations/${devStr}`);
}
