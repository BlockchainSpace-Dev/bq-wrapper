import path from "path";
import { fileURLToPath } from "url";

import { BigQuery } from "@google-cloud/bigquery";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";

import main from "../src/main.js";

const bq = new BigQuery();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("test main functions", () => {
  beforeAll(() => {
    config({ path: path.resolve(__dirname + "../../.env.test") });
  });

  it("must throw error when datasource not string and not includes '.' chars", () => {
    // Given
    const testDataSource = {};
    const testDataSource1 = "datasourcetest";

    // When

    // Then
    expect(() => main(testDataSource)).toThrowError(
      "datasource must be a text"
    );
    expect(() => main(testDataSource1)).toThrowError(
      "datasource has wrong format"
    );
  });

  it("must return certain module/function", () => {
    // Given
    const testDataSource = `${process.env.BQ_DATASET}.contacts`;
    const expectedObjectKeys = [
      "count",
      "delete",
      "find",
      "insert",
      "isExists",
      "max",
      "metadata",
      "model",
      "update",
    ];

    // When
    const model = main(testDataSource);

    // Then
    expect(Object.keys(model).sort()).toStrictEqual(expectedObjectKeys);
  });

  describe("should pass integration testing", () => {
    it("insert module testing", async () => {
      // Given
      const modelBQ = bq.dataset(process.env.BQ_DATASET).table("contacts");
      const modelMain = main(`${process.env.BQ_DATASET}.contacts`);

      const testContacts = [
        {
          name: faker.name.fullName(),
          address: faker.address.streetAddress(),
        },
      ];

      // When
      await modelMain.insert(testContacts);
      const [selectedContacts] = await modelBQ.query(
        `SELECT * FROM \`${process.env.BQ_DATASET}.contacts\` where name = "${testContacts[0].name}" AND address = "${testContacts[0].address}"`
      );

      // Then
      expect(selectedContacts.length).not.toBe(0);
    });

    it("update module testing", async () => {
      // Given
      const modelBQ = bq.dataset(process.env.BQ_DATASET).table("contacts");
      const modelMain = main(`${process.env.BQ_DATASET}.contacts`);

      const randomQuerySelect = `SELECT * FROM \`testing.contacts\` WHERE _PARTITIONTIME IS NOT NULL ORDER BY rand() LIMIT 1`;
      const [[randomContacts]] = await modelBQ.query(randomQuerySelect);

      const expectedUpdateData = {
        name: `${faker.name.fullName()}-update-test-${new Date()}`,
        address: faker.address.streetAddress(),
      };

      // When
      await modelMain.update(expectedUpdateData, randomContacts);
      const [selectedContacts] = await modelBQ.query(
        `SELECT * FROM \`${process.env.BQ_DATASET}.contacts\` where name = "${expectedUpdateData.name}" AND address = "${expectedUpdateData.address}"`
      );

      // Then
      expect(selectedContacts.length).not.toBe(0);
    });

    it("delete module testing", async () => {
      // Given
      const modelBQ = bq.dataset(process.env.BQ_DATASET).table("contacts");
      const modelMain = main(`${process.env.BQ_DATASET}.contacts`);

      const randomQuerySelect = `SELECT * FROM \`testing.contacts\` WHERE _PARTITIONTIME IS NOT NULL ORDER BY rand() LIMIT 1`;
      const [[randomContacts]] = await modelBQ.query(randomQuerySelect);

      // When
      await modelMain.delete(randomContacts);
      const [selectedContacts] = await modelBQ.query(
        `SELECT * FROM \`${process.env.BQ_DATASET}.contacts\` where name = "${randomContacts.name}" AND address = "${randomContacts.address}"`
      );

      // Then
      expect(selectedContacts.length).toBe(0);
    });

    it("count module testing", async () => {
      // Given
      const modelBQ = bq.dataset(process.env.BQ_DATASET).table("contacts");
      const modelMain = main(`${process.env.BQ_DATASET}.contacts`);

      // When
      const countResults = await modelMain.count({
        name: { value: `"%a%"`, operators: "LIKE" },
        _PARTITIONTIME: { value: null, operators: "IS NOT" },
      });
      const [[selectedContacts]] = await modelBQ.query(
        `SELECT COUNT(*) AS count FROM \`${process.env.BQ_DATASET}.contacts\` WHERE name LIKE "%a%" AND _PARTITIONTIME IS NOT NULL`
      );

      // Then
      expect(countResults.data.count).toBe(selectedContacts.count);
    });

    it("find module testing", async () => {
      // Given
      const modelBQ = bq.dataset(process.env.BQ_DATASET).table("contacts");
      const modelMain = main(`${process.env.BQ_DATASET}.contacts`);

      // When
      const findResults = await modelMain.find({
        fields: {
          name: { value: "fullName", operators: "AS" },
        },
        filters: {
          address: { value: `"%a%"`, operators: "LIKE" },
          name: { value: `"%b%"`, operators: "NOT LIKE" },
          _PARTITIONTIME: { value: null, operators: "IS NOT" },
        },
        orders: { key: "address", type: "DESC" },
        limit: 10,
        offset: 1,
      });
      const [selectedContacts] = await modelBQ.query(
        `SELECT name AS fullName FROM \`${process.env.BQ_DATASET}.contacts\` WHERE address LIKE "%a%" AND _PARTITIONTIME IS NOT NULL AND name NOT LIKE '%b%' ORDER BY address DESC LIMIT 10 OFFSET 1`
      );

      // Then
      expect(findResults.data.length).toBe(selectedContacts.length);
      expect(findResults.data[0].fullName).toBe(selectedContacts[0].fullName);
    });

    it("max module testing", async () => {
      // Given
      const modelBQ = bq.dataset(process.env.BQ_DATASET).table("contacts");
      const modelMain = main(`${process.env.BQ_DATASET}.contacts`);

      // When
      const maxResults = await modelMain.max("name", {
        _PARTITIONTIME: { value: null, operators: "IS NOT" },
      });
      const [[selectedContacts]] = await modelBQ.query(
        `SELECT MAX(name) AS max FROM \`${process.env.BQ_DATASET}.contacts\` WHERE _PARTITIONTIME IS NOT NULL`
      );

      // Then
      expect(maxResults.data.max).toBe(selectedContacts.max);
    });

    it("isExists module testing", async () => {
      // Given
      const testModel = main(`${process.env.BQ_DATASET}.contacts`);
      const testModel1 = main(`${process.env.BQ_DATASET}.random`);

      // When
      const modelIsExists = await testModel.isExists();
      const model1IsExists = await testModel1.isExists();

      // Then
      expect(modelIsExists).toBe(true);
      expect(model1IsExists).toBe(false);
    });

    it("metadata module testing", async () => {
      // Given
      const testModel = main(`${process.env.BQ_DATASET}.contacts`);
      const expectedMetadata = [
        { mode: "NULLABLE", name: "name", type: "STRING" },
        { mode: "NULLABLE", name: "address", type: "STRING" },
      ];

      // When
      const modelMetadata = await testModel.metadata();

      // Then
      expect(modelMetadata).toStrictEqual(expectedMetadata);
    });

    it("model module testing", async () => {
      // Given
      const { model } = main(`${process.env.BQ_DATASET}.contacts`);

      // When

      // Then
      expect(typeof model).toBe("object");
      expect(model?.bigQuery).not.toBe(undefined);
      expect(model?.methods).not.toBe(undefined);
    });
  });
});
