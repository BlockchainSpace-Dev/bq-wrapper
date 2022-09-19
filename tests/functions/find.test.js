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

describe("insert wrapper functions", () => {
  describe("should pass intergration testing", () => {
    beforeAll(() => {
      config({ path: path.resolve(__dirname + "../../../.env.test") });
    });

    it("should select data with no parameters", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const [[randomContacts]] = await model.query(
        `SELECT * FROM \`testing.contacts\``
      );

      // When
      const findUpdateProcess = await find(
        model,
        {
          dataset: "testing",
          table: "contacts",
        },
        handleResponse
      );

      // Then
      expect(findUpdateProcess.status).toBe("success");
      expect(findUpdateProcess.error).toBe(null);
      expect(findUpdateProcess.query).toBe(
        `SELECT * FROM \`testing.contacts\``
      );
      expect(findUpdateProcess.data.length).toBe(randomContacts.length);
      expect(findUpdateProcess.data).toStrictEqual(randomContacts);
    });

    it("shold select data with certain parameters", async () => {
      // Given
      const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

      const expectedQuery = `SELECT name AS fullName FROM \`testing.contacts\` WHERE name LIKE "%a%" AND address LIKE "%a%" ORDER BY name DESC LIMIT 2 OFFSET 3`;

      const [[randomContacts]] = await model.query(expectedQuery);

      // When
      const findUpdateProcess = await find(
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
      expect(findUpdateProcess.status).toBe("success");
      expect(findUpdateProcess.error).toBe(null);
      expect(findUpdateProcess.query).toBe(expectedQuery);
      expect(findUpdateProcess.data.length).toBe(randomContacts.length);
      expect(findUpdateProcess.data).toStrictEqual(randomContacts);
    });
  });
});
