import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";

import { insert } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("insert wrapper functions", () => {
  it("should throw error when data not an array or don't have items", async () => {
    // Given
    const testArguments = [null, null, null];
    const testArguments1 = [null, null, []];

    // When

    // Then
    await insert(...testArguments).catch((error) => {
      expect(error.message).toBe(
        "Data must be an array object and has a value"
      );
    });
    await insert(...testArguments1).catch((error) => {
      expect(error.message).toBe(
        "Data must be an array object and has a value"
      );
    });
  });

  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should inserted data with array list that lower than 1000 rows", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const dummyContacts = [...Array(100).keys()].map((item) => ({
        name: faker.name.fullName(),
        address: faker.address.streetAddress(),
      }));

      // When
      const testInsertProcess = await insert(
        model,
        handleResponse,
        dummyContacts
      );

      // Then
      expect(testInsertProcess).toStrictEqual({
        status: "success",
        error: null,
        query: null,
        totalRows: 100,
        totalBytesProcessed: 0,
        data: null,
      });
    });

    it("should inserted data with array list that more than 1000 rows", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const dummyContacts = [...Array(1001).keys()].map((item) => ({
        name: faker.name.fullName(),
        address: faker.address.streetAddress(),
      }));

      // When
      const testInsertProcess = await insert(
        model,
        handleResponse,
        dummyContacts
      );

      // Then
      expect(testInsertProcess).toStrictEqual({
        status: "success",
        error: null,
        query: null,
        totalRows: 1001,
        totalBytesProcessed: 0,
        data: null,
      });
    });
  });
});
