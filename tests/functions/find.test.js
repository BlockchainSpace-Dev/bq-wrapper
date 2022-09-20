import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { config } from "dotenv";

import { find } from "../../src/functions/index.js";
import { handleResponse } from "../../src/helpers/index.js";
import queryJoin from "../../src/helpers/queryJoin.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("find wrapper functions", () => {
  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should select data with no parameters", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const [randomContacts] = await model.query(
        `SELECT * FROM \`testing.contacts\``
      );

      // When
      const findProcess = await find(
        model,
        {
          dataset: "testing",
          table: "contacts",
        },
        handleResponse
      );

      // Then
      expect(findProcess.status).toBe("success");
      expect(findProcess.error).toBe(null);
      expect(findProcess.query).toBe(`SELECT * FROM \`testing.contacts\``);
      expect(findProcess.data[0].length).toBe(randomContacts[0].length);
    });

    it("shold select data with certain parameters", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const expectedQuery = `SELECT name AS fullName FROM \`testing.contacts\` WHERE name LIKE "%a%" AND address LIKE "%a%" ORDER BY name DESC LIMIT 2 OFFSET 3`;

      const [randomContacts] = await model.query(expectedQuery);

      // When
      const findProcess = await find(
        model,
        {
          dataset: "testing",
          table: "contacts",
        },
        handleResponse,
        {
          fields: queryJoin({
            paramsObj: { name: { value: "fullName", operators: "AS" } },
          }),
          filters: queryJoin({
            paramsObj: {
              name: { value: `"%a%"`, operators: "LIKE" },
              address: { value: `"%a%"`, operators: "LIKE" },
            },
            delimiters: " AND ",
          }),
          orders: { key: "name", type: "DESC" },
          limit: 2,
          offset: 3,
        }
      );

      // Then
      expect(findProcess.status).toBe("success");
      expect(findProcess.error).toBe(null);
      expect(findProcess.query).toBe(expectedQuery);
      expect(findProcess.data[0].length).toBe(randomContacts[0].length);
      expect(findProcess.data).toStrictEqual(randomContacts);
    });
  });
});
