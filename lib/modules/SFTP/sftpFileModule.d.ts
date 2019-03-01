/**
 * This is the SFTP class, including findOutTargetCSV(), writeFile(), detectFile()
 */
export declare class SFTP {
    private host;
    private port;
    private username;
    private password;
    private sftp;
    private targetFile?;
    private targetDir?;
    /**
     *
     * @param {sftp host url: String} host
     * @param {sftp port: String} port
     * @param {username: String} username
     * @param {password: String} password
     */
    constructor(targetFile?: string | undefined, dir?: string, host?: string, port?: string, username?: string, password?: string);
    downloadTargetFile(targetFile?: string | undefined, targetDir?: string | undefined): Promise<{
        result: boolean;
        message: {
            path: any;
        };
    }>;
    downloadFiles(startTime?: string, endTime?: string, targetDir?: string | undefined): Promise<{
        result: boolean;
        message: {
            paths: any;
        };
    }>;
    /**
     * Create a connecton to the sftp server
     */
    createConnection(): Promise<{}>;
    endConnection(): void;
    readonly getEventEmiiter: any;
}
