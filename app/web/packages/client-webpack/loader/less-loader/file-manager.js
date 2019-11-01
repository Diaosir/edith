/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
import * as path from '@/utils/path'
export default function(loaderContext, files) {
  return {
    install(less, pluginManager) {
      class FileManager extends less.FileManager {
        supports() {
          return true;
        }
        getPath(filename) {
          const { dir } = path.parse(filename);
          return dir || '';
        }
        async loadFile(filename, currentDirectory) {
          // console.log(currentDirectory)
          // loaderContext.addDependency(filename);
          if(path.parse(filename).ext === '') {
            filename = `${filename}.less`
          }
          return new Promise((resolve, reject) => {
            try{
              const href = path.normalize(path.originalResolve(currentDirectory, filename));
              const content = files[href] || '';
              resolve({
                contents: content,
                filename: href
              })
            } catch(error) {
            }
          })
        }
      }
      pluginManager.addFileManager(new FileManager());
    },
  };
}