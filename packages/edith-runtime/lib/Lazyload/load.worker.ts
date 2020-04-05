const ctx: Worker = self as any;
self.addEventListener('message', (ev: MessageEvent) => {
  const { data } = ev;
  if(data && data.type === 'lazyload-npm-module') {
    doXHR(data.payload.url, function(result) {
      ctx.postMessage({
        type: `lazyload-npm-module-result-${data.payload.url}`,
        payload: {
          error: null,
          result,
          url: data.payload.url
        }
      })
    }, function(status, url) {
      ctx.postMessage({
        type: `lazyload-npm-module-result-${url}`,
        payload: {
          error: status,
          url: data.payload.url
        }
      })
    })
  }
})

function doXHR(url: string, callback: Function, errorCallback?: Function) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET',  url);
  xhr.send(null);
  function handleResponse(xhr, callback, errorCallback){
    if (xhr.status >= 200 && xhr.status < 300) {
        callback(xhr.responseText);
    } else if (typeof errorCallback === 'function') {
      errorCallback(xhr.status, url);
    }
  }
  xhr.onreadystatechange = function() {
    if( xhr.readyState === 4) {
      handleResponse(xhr, callback, errorCallback);
    }
  }
}
