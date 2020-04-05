// This is a less plugin to resolve paths
import FileManager from './file-manager';
self.less = {
  env: 'development',
};

// Stub window for less....
self.window = self;
self.window.document = {
  currentScript: { async: true },
  createElement: () => ({ appendChild: () => {} }),
  createTextNode: () => ({}),
  getElementsByTagName: () => [],
  head: { appendChild: () => {}, removeChild: () => {} },
};

self.importScripts(
  `https://unpkg.com/less@3.10.3/dist/less.min.js`
);

self.postMessage('ready');

self.addEventListener('message', event => {
  const { code, path, files } = event.data.payload;
  let dependencies = [];
  const context = {
    addDependency: depPath => {
      dependencies.push(depPath);
      self.postMessage({ type: 'add-transpilation-dependency', path: depPath });
    },
  };
  
  // Remove the linebreaks at the beginning of the file, it confuses less.
  const cleanCode = code.replace(/^\n$/gm, '');

  try {
    // register a custom importer callback
    less
      .render(cleanCode, { filename: path, javascriptEnabled: true , plugins: [FileManager(context, files)]})
      .then(({ css }) =>
        self.postMessage({
          type: 'success',
          payload: {
            code: css,
            dependencies: [],
            path: path
          }
        })
      )
      .catch(err => {
        console.log(err)
        self.postMessage({
          type: 'error',
          error: err,
        })
      });
  } catch (e) {
    self.postMessage({
      type: 'error',
      error: e,
    });
  }
});