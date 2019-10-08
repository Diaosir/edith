import File from '@/datahub/project/entities/file'

export default class PackageJsonFile extends File {
    public json: {
        dependencies?: {
          [key: string]: string;
        },
        [key:string]: any;
    } = {};
    public entryFile: File;
    constructor(options){
        super(options);
        try{
            this.json = JSON.parse(this.value);
        } catch(error) {

        }
    }
    public getEntryFilePath(): string | null {
        return this.json.main || null;
    }
    public getDependencies() {
        const dependencies = this.json.dependencies || {};
        return dependencies;
    }
}