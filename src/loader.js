// Import configuration schema module
import { config } from "./config.js";

// Load credentials to env variable
process.env[config.get("bigquery.credentials.keyname")] = config.get(
  "bigquery.credentials.pathname"
);

export const env = config;

export const args = config
  .getArgs()
  .map((x) => ({ [x.split("=")[0]]: x.split("=")[1] }))
  .reduce((p, n) => ({ ...p, ...n }));
