/* eslint-disable no-param-reassign */
import path from 'path-browserify';

self.importScripts([
  'https://cdnjs.cloudflare.com/ajax/libs/typescript/2.7.2/typescript.min.js',
]);

const ROOT_URL = `https://cdn.jsdelivr.net/`;

const loadedTypings = [];

const fetchCache = new Map();

const doFetch = url => {
  const cached = fetchCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = fetch(url)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || response.status);
      error.response = response;
      return Promise.reject(error);
    })
    .then(response => response.text())

  fetchCache.set(url, promise);
  return promise;
};
self.addEventListener('message', event => {
  const { url } = event.data;
  doFetch(url);
});
