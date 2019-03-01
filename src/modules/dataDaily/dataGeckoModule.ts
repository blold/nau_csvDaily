const rp = require("request-promise");
import DB from "../dbModule";

export class Gecko {
  private initDb: any;
  private gecUrl?: string;

  /**
   *
   * @param table
   * @param url : default value is https://api.coingecko.com/api/v3
   * @param database : default database is exchangeDb
   */
  constructor(
    table?: string,
    url: string = "https://api.coingecko.com/api/v3",
    database = "exchangeDb"
  ) {
    this.initDb = new DB(database, table);
    this.gecUrl = url;
  }

  /**
   *
   * @param name default value is bitcoin, name of coin, can be found in https://www.coingecko.com/api/docs
   * @param table table of db, default value is crypto_prices
   */
  coins(name: string = "bitcoin", table: string = "crypto_prices") {
    let options = { uri: `${this.gecUrl}/coins/${name}`, json: true };
    let self = this;
    return rp(options)
      .then(async function(d: any) {
        let obj = {
          currentPrice_btc: d.market_data.current_price.btc,
          currentPrice_usd: d.market_data.current_price.usd,
          marketCap_btc: d.market_data.market_cap.btc,
          marketCap_usd: d.market_data.market_cap.usd,
          high_btc: d.market_data.high_24h.btc,
          high_usd: d.market_data.high_24h.usd,
          low_btc: d.market_data.low_24h.btc,
          low_usd: d.market_data.low_24h.usd,
          coin: d.symbol
        };
        let result = await self.initDb.insertData(obj, table);

        if (result) return { result: true };
        else return { result: false };
      })
      .catch(function(e: any) {
        // API call failed...
        console.log(e);
      });
  }

  /**
   *
   * @param name default value is bitcoin, name of coin, can be found in https://www.coingecko.com/api/docs
   * @param table table of db, default value is crypto_prices
   */
  exchange(name: string = "binance", table: string = "exchange") {
    let options = { uri: `${this.gecUrl}/exchanges/${name}`, json: true };
    let self = this;
    return rp(options)
      .then(async function(d: any) {
        let rate = await getBTCUSDRate();
        let obj = { name: name, tradeVol_BTC: d.trade_volume_24h_btc, tradeVal_USD: (rate * d.trade_volume_24h_btc)};
        let result = self.initDb.insertData(obj, table);
        if (result) return { result: true };
        else return { result: false };
      })
      .catch(function(e: any) {
        console.log(e);
      });
  }
}

async function getBTCUSDRate(){
  let rate = await rp.get('https://api.coingecko.com/api/v3/exchange_rates');
  return JSON.parse(rate).rates.usd.value;
}