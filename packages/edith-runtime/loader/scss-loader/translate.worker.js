import { parse, normalize, originalResolve} from 'edith-utils/lib/path'
// import Sass from './sass.sync.js'
self.importScripts([
  'https://unpkg.com/sass.js@0.11.1/dist/sass.sync.js',
]);

self.postMessage('ready');
self.addEventListener('message', ( event ) => {
  const { code, path, indentedSyntax , files, node_modules_path } = event.data.payload;
  const { dir: _path } = parse(path)
  Sass._path = _path;
  Sass.clearFiles();
  Sass.importer(async (request, done) => {
    const { resolved, current } = request;
    console.log(node_modules_path)
    let filename = resolved;
    let file = files[filename]
    if(!file) {
      filename = originalResolve(node_modules_path, current);
      file = files[filename];
    }
    if(!file) {
      console.log(files, filename)
      throw new Error(`this file ${filename} is not found1111`)
    }
    Sass.writeFile(filename, file, () => {
      done({
        path: filename,
      });
    });
  })
  const now = Date.now()
  Sass.compile(
    code, 
    {
      sourceMapEmbed: true,
      indentedSyntax,
    },
    result => {
      console.log(`sass worker 编译${path}耗时：${(Date.now() - now) / 1000}s`)
      if (result.status === 0) {
        self.postMessage({
          type: 'success',
          payload: {
            code: result.text,
            dependencies: [],
            path: path
          }
        })
      } else {
        self.postMessage({
          type: 'error',
          error: result.formatted,
          path: result.file && result.file.replace('/sass/', '')
        })
      }
    }
  )
})