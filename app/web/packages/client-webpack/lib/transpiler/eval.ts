
import File, { FileType } from '@/datahub/project/entities/file'
import { setStylesheet, deleteStylesheet} from '../../utils'

export default function execute({ code, path }): Function {
  const fileType = File.filenameToFileType(path);
  if([FileType.JS, FileType.JSON, FileType.JSX,FileType.TS, FileType.TSX, FileType.VUE].includes(fileType)) {
    return function(module, exports, __edith_require__) {
      try{
        eval(`${code}\n//# sourceURL=edith:${path}?`)
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