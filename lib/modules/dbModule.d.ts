export default class SQLDB {
    private database;
    private table?;
    private host;
    private user;
    private password;
    private con;
    constructor(database?: string, table?: string, host?: string, user?: string, password?: string);
    createConnection(): Promise<{}>;
    getAllData(table?: string | undefined): Promise<{}>;
    getOneData(id: string, table?: string | undefined): Promise<{}>;
    runCustomQuery(): any;
    insertData(object: any, table?: string | undefined): Promise<{}>;
    transacting(object: any, table?: string | undefined): Promise<{}>;
    deleteOneData(id: string, table?: string | undefined): Promise<{}>;
    createTable(object: any, tableName?: string | undefined): Promise<{}>;
    countData(table?: string | undefined): Promise<{}>;
    checkDataExist(object: any, table?: string | undefined): Promise<{}>;
    truncate(table?: string | undefined): Promise<{}>;
    dropTable(tableName?: string | undefined): Promise<{}>;
    destoryConnect(): {
        result: boolean;
    };
}
