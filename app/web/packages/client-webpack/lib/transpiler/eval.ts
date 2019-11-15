
import File, { FileType } from '@/datahub/project/entities/file'
import { setStylesheet } from '../../utils'
const defaultGlobals = {
  process: {
    env: {
      NODE_ENV: "development"
    }
  }
}
export default function execute({ code, path, globals = {}}): Function {
  const fileType = File.filenameToFileType(path);
  if([FileType.JS, FileType.JSX,FileType.TS, FileType.TSX, FileType.VUE].includes(fileType)) {
    return function(module, exports, __edith_require__) {
      const allGlobals = {
        module,
        __edith_require__,
        exports,
        ...defaultGlobals,
        ...globals
      }
      const allGlobalKeys = Object.keys(allGlobals);
      const globalsCode = allGlobalKeys.length ? allGlobalKeys.join(', ') : '';
      const globalsValues = allGlobalKeys.map(k => allGlobals[k]);
      try{
        const newCode = `(function evaluate(` + globalsCode + `) {` + code + `\n})`;
        (0, eval)(`${newCode} \n //# sourceURL=edith:${path}?`).apply(null, globalsValues);
      } catch(error){
          // Todo log execute error
          throw error
      }
    }
  }
  if ([FileType.SCSS, FileType.CSS,FileType.LESS].includes(fileType)) {
    return function(module, exports, __edith_require__) {
      try{
        setStylesheet(code, path);
      } catch(error){
          // Todo log execute error
          console.log(error)
      }
    }
  }
  return function() {
  }
}