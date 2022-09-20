import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { config } from "dotenv";

import { max } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";
import queryJoin from "../../src/helpers/queryJoin.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("max wrapper functions", () => {
  it("should throw error when datasource is not object or not defined", async () => {
    // Given
    const testArguments = [null, null, null, null, null];
    const testArguments1 = [null, {}, null, null, {}];

    // When

    // Then
    await max(...testArguments).catch((error) => {
      expect(error.message).toBe(
        "datasource is required and must be an object"
      );
    });
    await max(...testArguments1).catch((error) => {
      expect(error.message).toBe("datasource must have fields");
    });
  });

  it("should throw error when fieldname is not string or an empty string", async () => {
    // Given
    const datasource = { dataset: "test", table: "test" };
    const testArguments = [null, datasource, null, null, null];
    const testArguments1 = [null, datasource, null, "", null];

    // When

    // Then
    await max(...testArguments).catch((error) => {
      expect(error.message).toBe(
        "fieldname must be a string and cannot be empty string"
      );
    });
    await max(...testArguments1).catch((error) => {
      expect(error.message).toBe(
        "fieldname must be a string and cannot be empty string"
      );
    });
  });

  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should return same rows with native query count", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const expectedQueryString = `SELECT MAX(name) as max FROM \`testing.contacts\` WHERE _PARTITIONTIME IS NOT null `;

      const [[expectedRowsMAX]] = await model.query(expectedQueryString);

      // When
      const maxProcess = await max(
        model,
        { dataset: "testing", table: "contacts" },
        handleResponse,
        "name",
        queryJoin({
          paramsObj: { _PARTITIONTIME: { value: null, operators: "IS NOT" } },
        })
      );

      // Then
      expect(maxProcess.status).toBe("success");
      expect(maxProcess.error).toBe(null);
      expect(maxProcess.query).toBe(expectedQueryString);
      expect(maxProcess.totalRows).toBe(1);
      expect(maxProcess.data.max).toBe(expectedRowsMAX.max);
    });
  });
});
