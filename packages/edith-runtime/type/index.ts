import File, { FileType } from 'edith-types/lib/file';
export interface IClientWebpackOption {
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