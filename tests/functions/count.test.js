import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";

import { count } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";
import queryJoin from "../../src/helpers/queryJoin.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("count wrapper functions", () => {
  it("should throw error when datasource is not object or not defined", async () => {
    // Given
    const testArguments = [null, null, null, null, null];
    const testArguments1 = [null, {}, null, null, {}];

    // When

    // Then
    await count(...testArguments).catch((error) => {
      expect(error.message).toBe(
        "datasource is required and must be an object"
      );
    });
    await count(...testArguments1).catch((error) => {
      expect(error.message).toBe("datasource must have fields");
    });
  });

  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should return same rows with native query count", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const expectedQueryString = `SELECT COUNT(*) as count FROM \`testing.contacts\` WHERE _PARTITIONTIME IS NOT null `;

      const [[expectedRowsCount]] = await model.query(expectedQueryString);

      // When
      const countProcess = await count(
        model,
        { dataset: "testing", table: "contacts" },
        handleResponse,
        queryJoin({
          paramsObj: { _PARTITIONTIME: { value: null, operators: "IS NOT" } },
        })
      );

      // Then
      expect(countProcess.status).toBe("success");
      expect(countProcess.error).toBe(null);
      expect(countProcess.query).toBe(expectedQueryString);
      expect(countProcess.totalRows).toBe(1);
      expect(countProcess.data.count).toBe(expectedRowsCount.count);
    });
  });
});
