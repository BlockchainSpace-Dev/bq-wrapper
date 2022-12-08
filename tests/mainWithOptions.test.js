import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { config } from "dotenv";

import main from "../src/main.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("test main functions with custom options", () => {
  beforeAll(() => {
    config({ path: path.resolve(__dirname + "../../.env.test") });
  });

  describe("should pass integration testing", () => {
    it("find module testing with custom options and can read table base on google sheet", async () => {
      // Given
      const scopes = [
        "https://www.googleapis.com/auth/bigquery",
        "https://www.googleapis.com/auth/drive",
      ];

      const modelBQ = new BigQuery({ scopes });
      const modelMain = main(`${process.env.BQ_DATASET2}.wallet_address`);
      const modelMain2 = main(`${process.env.BQ_DATASET2}.wallet_address`, {
        keyFilename: path.resolve(__dirname + "../../credentials.json"),
        scopes,
      });

      // When
      const findResults = await modelMain.find();
      const findResults2 = await modelMain2.find();
      const [selectedData] = await modelBQ.query(
        `SELECT * FROM \`${process.env.BQ_DATASET2}.wallet_address\``
      );

      // Then
      expect(findResults.data.length).toBe(selectedData.length);
      expect(findResults2.data.length).toBe(selectedData.length);
      expect(findResults.data.length).toBe(findResults2.data.length);
    });
  });
});
