import File, { FileType } from 'edith-types/lib/file';
export interface IEdithRuntimeOption {
    template?: string;
    fileList?: Array<File>;
    document?: string;
    alias?: {
        [key: string]: string;
    },
    moduleSuffix?: Array<string>
}
export interface ITranspiler {

}