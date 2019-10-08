import File, { FileType } from '@/datahub/project/entities/file';
export default class TranspilerModule {
    path: string;
    type: FileType;
    code: string;
    transpiledValue: string;
    denpencies: Array<TranspilerModule> = [];
    constructor({code, path}){
        this.code = code;
        this.path = path
    }
}