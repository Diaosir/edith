import { parse, normalize, originalResolve} from '@/utils/path'

self.importScripts([
  'https://cdnjs.cloudflare.com/ajax/libs/sass.js/0.11.0/sass.sync.js',
]);

self.postMessage('ready');
self.addEventListener('message', ( event ) => {
  const { code, path, indentedSyntax , files } = event.data.payload;
  const { dir: _path } = parse(path)
  Sass._path = _path;
  Sass.clearFiles();
  Sass.importer(async (request, done) => {

    // const currentPath = request.previous === 'stdin' ? path : request.previous;
    // const { dir: currentDirectory } = parse(currentPath);
    // const href = normalize(originalResolve(currentDirectory, request.current));
    const filename = request.resolved;
    try{
      if(!files[filename]) {
        throw new Error(`this file ${filename} is not found`)
      }
      Sass.writeFile(filename, files[filename], () => {
        done({
          path: filename,
        });
      });
    } catch(e) {
      done({ error: e.message });
    }
  })
  Sass.compile(
    code, 
    {
      sourceMapEmbed: true,
      indentedSyntax,
    },
    result => {
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
        console.log(result)
        self.postMessage({
          type: 'error',
          error: result.formatted,
          path: result.file && result.file.replace('/sass/', '')
        })
      }
    }
  )
})