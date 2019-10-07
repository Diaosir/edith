import File from '@/datahub/project/entities/file'
export interface IClientWebpackOption {
    template?: string;
    fileList?: Array<File>;
    document?: string;
}