declare const dataStoreRun: unique symbol;
declare const netverifyRun: unique symbol;
export declare class JumioMainSync {
    private query;
    private initDb;
    constructor(table?: string, database?: string, namespace?: string, kind?: string);
    /**
     *  Main function to run the program defaultly
     */
    mainRun(limit: number): void;
    /**
     * private function to run the query of the datastore
     */
    [dataStoreRun](): Promise<{}>;
    /**
     *  To send the request the netverify and Retrieving scan details with the Jumio Reference
     */
    [netverifyRun](data: any, limit?: any): void;
    readonly getEventEmit: any;
}
export {};
