var cron = require("node-cron");

cron.schedule("*/15 * * * *", () => {
  console.log("running cron every 15 minute");
});
