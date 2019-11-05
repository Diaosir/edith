import { FileType } from '@/datahub/project/entities/file';

export const defaultOptions = {
  presets: [["typescript", { allExtensions: true , isTSX: true}], 'es2015', 'react'],
  plugins: ['proposal-class-properties']
}
export function getOptionsByFileType(fileType: FileType) {
  return defaultOptions
}