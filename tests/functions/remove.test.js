import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { config } from "dotenv";

import { remove } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";
import queryJoin from "../../src/helpers/queryJoin.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("delete wrapper functions", () => {
  it("should throw error when string filter data is empty string or not defined", async () => {
    // Given
    const testArguments = [null, null, null, null];
    const testArguments1 = [null, null, null, ""];

    // When

    // Then
    await remove(...testArguments).catch((error) => {
      expect(error.message).toBe("string query filters must be exists");
    });
    await remove(...testArguments1).catch((error) => {
      expect(error.message).toBe("string query filters must be exists");
    });
  });

  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should delete certain rows", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const [[randomContacts]] = await model.query(
        `SELECT * FROM \`testing.contacts\` WHERE _PARTITIONTIME IS NOT NULL ORDER BY rand() LIMIT 1`
      );

      const expectedQuery = `DELETE FROM \`testing.contacts\` WHERE name = "${randomContacts.name}" AND address = "${randomContacts.address}"`;

      // When
      const testDeleteProcess = await remove(
        model,
        { dataset: "testing", table: "contacts" },
        handleResponse,
        queryJoin({ paramsObj: randomContacts, delimiters: " AND " })
      );
      const [deletedContacts] = await model.query(
        `SELECT * FROM \`testing.contacts\` WHERE name = "${randomContacts.name}" AND address = "${randomContacts.address}"`
      );

      // Then
      expect(testDeleteProcess.status).toBe("success");
      expect(testDeleteProcess.error).toBe(null);
      expect(testDeleteProcess.query).toBe(expectedQuery);
      expect(deletedContacts.length).toBe(0);
    });
  });
});
