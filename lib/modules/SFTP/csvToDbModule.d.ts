import DB from "../dbModule";
export declare class CSVToDB {
    private parser;
    private transform;
    private path?;
    private paths?;
    /**
     *
     * @param {the path of file: String} path
     * @param {mysql database: String} database
     * @param {db table: String} table
     * @param {no need passing} currentDB
     */
    constructor(path?: string, paths?: any, database?: string, table?: string, currentDB?: DB);
    /**
     * Run the programe and use the parser and transfrom to read CSV
     */
    singleFile(path?: string | undefined): void;
    multipleFiles(paths?: any): void;
    readonly getEventEmiiter: any;
}
