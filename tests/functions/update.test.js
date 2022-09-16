import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";

import { update } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";
import queryJoin from "../../src/helpers/queryJoin.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("update wrapper functions", () => {
  it("should throw error when data or filters is not object or not have fields", async () => {
    // Given
    const testArguments = [null, null, null, null, null, null];
    const testArguments1 = [null, null, null, null, {}, {}];

    // When

    // Then
    await update(...testArguments).catch((error) => {
      expect(error.message).toBe("data and filters must be an object");
    });
    await update(...testArguments1).catch((error) => {
      expect(error.message).toBe("data and filters must have fields");
    });
  });

  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should updated data with certain value", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const [[randomContacts]] = await model.query(
        `SELECT * FROM \`testing.contacts\` ORDER BY rand() LIMIT 1`
      );

      const newTestContacts = {
        name: faker.name.fullName(),
        address: faker.address.streetAddress(),
      };

      // When
      const testUpdateProcess = await update(
        model,
        { dataset: "testing", table: "contacts" },
        handleResponse,
        queryJoin,
        newTestContacts,
        randomContacts
      );

      // Then
      expect(testUpdateProcess.status).toBe("success");
      expect(testUpdateProcess.error).toBe(null);
      expect(testUpdateProcess.query).toBe(
        `UPDATE \`testing.contacts\` set name = "${newTestContacts.name}",address = "${newTestContacts.address}" WHERE name = "${randomContacts.name}" AND address = "${randomContacts.address}"`
      );
    });
  });
});
