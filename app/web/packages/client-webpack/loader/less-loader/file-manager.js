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
      // function CSBFileManager() {}

      // CSBFileManager.prototype = new less.FileManager();
      // CSBFileManager.prototype.constructor = CSBFileManager;
      // CSBFileManager.prototype.supports = function(filename) {
      //   return true;
      // };

      // CSBFileManager.prototype.resolve = function(filename) {
      //   return new Promise((resolve, reject) => {
      //     try {
      //       loaderContext.addDependency(filename);

      //       const module = files[filename];
      //       resolve(module);
      //     } catch (e) {
      //       reject(e);
      //     }
      //   });
      // };

      // CSBFileManager.prototype.loadFile = function(filename) {
      //   return this.resolve(filename).then(code => ({
      //     contents: code,
      //     filename,
      //   }));
      // };
      pluginManager.addFileManager(new FileManager());
    },
  };
}