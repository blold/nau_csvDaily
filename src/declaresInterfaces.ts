export interface requestTaskOption {
  readonly db: any;
  readonly options: {
    url: string;
    header: {
      "User-Agent": string;
      Accept: string;
    };
    auth: {
      user: string;
      pass: string;
    };
    json: boolean;
    Connection: string;
  };
}
