const schedule = require("node-schedule");
require("events").EventEmitter.defaultMaxListeners = Infinity;

import { Gecko } from "./modules/dataDaily/dataGeckoModule";

/**
 * 1. Right now, the programe will be executed when the second is 30, more detail: https://github.com/node-schedule/node-schedule
 * 2. Run the sftp program to get the c
 * 
 * Time schedule setting:
      *    *    *    *    *    * 
      ┬    ┬    ┬    ┬    ┬    ┬
      │    │    │    │    │    │
      │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
      │    │    │    │    └───── month (1 - 12)
      │    │    │    └────────── day of month (1 - 31)
      │    │    └─────────────── hour (0 - 23)
      │    └──────────────────── minute (0 - 59)
      └───────────────────────── second (0 - 59, OPTIONAL)
 */

schedule.scheduleJob("*/10 * * * *", async function() {
  let gec = new Gecko();
  let coins = await gec.coins();
  let exchange = await gec.exchange();

  if (coins) console.log("Coins inserted successfully");
  if (exchange) console.log("Exhange inserted successfully");
});
