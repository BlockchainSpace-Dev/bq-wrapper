import { BigQuery } from "@google-cloud/bigquery";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";

import { insert } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";

const bq = new BigQuery();

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
      config({ path: "" });
    });

    it("should inserted data with array list that lower than 1000 rows", async () => {
      // Given
      const model = bq.dataset();
      const dummyContacts = [...Array(100).keys()].map((item) => ({
        name: faker.name.fullName(),
        address: faker.address.streetAddress(),
      }));

      // When

      // Then
    });
  });
});
