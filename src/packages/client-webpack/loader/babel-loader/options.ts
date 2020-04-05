import { FileType } from '@/datahub/project/entities/file';

export const defaultOptions = {
  presets: ['es2015', 'react'],
  plugins: ['proposal-class-properties']
}
export function getOptionsByFileType(fileType: FileType) {
  if(fileType === FileType.TS) {
    return {
      presets: [["typescript", { allExtensions: true }], 'es2015', 'react'],
      plugins: ['proposal-class-properties']
    }
  }
  if(fileType === FileType.TSX) {
    return {
      presets: [["typescript", { allExtensions: true, isTSX: true}], 'es2015', 'react'],
      plugins: ['proposal-class-properties']
    }
  }
  return defaultOptions
}