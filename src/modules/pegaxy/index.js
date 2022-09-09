// Import configuration modules
import { env, args } from "../../loader.js";
// Import lib modules
import database from "../../lib/database.js";
// Import scraper function modules
import heroes from "./heroes.js";
// Validate node arguments
if (!args?.f || !args?.function)
  throw new Error("function arguments not exist");
if (!args?.d || !args?.datasource)
  throw new Error("dataset arguments not exists");
// Load function modules dependencies
const dependencies = { model: {} };
