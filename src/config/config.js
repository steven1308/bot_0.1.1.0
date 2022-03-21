const commonEnv = require("./config.common");
const prodEnv = require("./config.prod");
const devEnv = require("./config.dev");

const ENV = process.env.NODE_ENV || "development";

let env;

switch (ENV) {
    case "production":
        env = prodEnv;
        break;
    case "development":
        env = devEnv;
        break;
    default:
        throw new Error(`no matching constants file found for env '${env}'`);
}

module.exports = Object.assign(commonEnv, env);
