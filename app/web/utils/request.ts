import { fetch as originalFetch } from 'dva';
const fetch = function (input, opts?: any) { //定义新的fetch方法, 添加了超时处理
  return new Promise(function (resolve, reject) {
    var timeoutId = setTimeout(function () {
      console.log('服务超时，请稍后再试')
      reject(new Error("fetch timeout"))
    }, opts.timeout || 20000);
    originalFetch(input, opts).then(
      res => {
        clearTimeout(timeoutId);
        resolve(res)
      },
      err => {
        clearTimeout(timeoutId);
        reject(err)
      }
    ).catch(err => {
      console.warn(err);
    });
  })
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  console.log('服务异常，请稍后再试')
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request(url, options?: any) {
  if (!options.headers) {
    options.headers = {};
  }
  var body = options.body;
  try{
    body = JSON.parse(options.body);
  } catch(error) {

  }
  options.headers = {
    'Content-type': typeof body === 'string' ? "text/plain;charset=UTF-8" : 'application/json',
    ...options.headers
  }
  const response:any = await fetch(url, options);
  checkStatus(response);

  const data = await response.json();
  const ret = {
    data,
    headers: {},
  };
  if(response.headers.get('x-auth-access-token')) {
    ret.headers = {
      token: response.headers.get('x-auth-access-token')
    }
  }
  return ret;
}
