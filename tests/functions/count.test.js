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

  it("should throw error when filters is not object or not defined", async () => {
    // Given
    const testArguments = [
      null,
      { dataset: "", table: "" },
      null,
      null,
      "test",
    ];
    const testArguments1 = [null, { dataset: "", table: "" }, null, null, {}];

    // When

    // Then
    await count(...testArguments).catch((error) => {
      expect(error.message).toBe("filters must be an object");
    });
    await count(...testArguments1).catch((error) => {
      expect(error.message).toBe("filters must have fields");
    });
  });

  // describe("should pass intergration testing", () => {
  //   beforeAll(() => {
  //     config({ path: path.resolve(__dirname + "../../../.env.test") });
  //   });

  //   it("should updated data with certain value", async () => {
  //     // Given
  //     const model = bq.dataset(process.env.BQ_DATASET).table("contacts");

  //     const [[randomContacts]] = await model.query(
  //       `SELECT * FROM \`testing.contacts\` ORDER BY rand() LIMIT 1`
  //     );

  //     const newTestContacts = {
  //       name: faker.name.fullName(),
  //       address: faker.address.streetAddress(),
  //     };

  //     // When
  //     const testUpdateProcess = await update(
  //       model,
  //       { dataset: "testing", table: "contacts" },
  //       handleResponse,
  //       queryJoin,
  //       newTestContacts,
  //       randomContacts
  //     );

  //     // Then
  //     expect(testUpdateProcess.status).toBe("success");
  //     expect(testUpdateProcess.error).toBe(null);
  //     expect(testUpdateProcess.query).toBe(
  //       `UPDATE \`testing.contacts\` set name = "${newTestContacts.name}",address = "${newTestContacts.address}" WHERE name = "${randomContacts.name}" AND address = "${randomContacts.address}"`
  //     );
  //   });
  // });
});
