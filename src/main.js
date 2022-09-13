import { BigQuery } from "@google-cloud/bigquery";

import { handleResponse, queryJoin } from "./helpers/index.js";

import { insert, update, remove, count, find } from "./functions/index.js";

// Initiate Bigquery instance
const bigquery = new BigQuery();

/**
 * Database/Repository constructor
 * @param {string} datasource Name of data source, example: dataset.tablename
 * @returns {object}
 */
export default (datasource) => {
  if (!typeof datasource === "string")
    throw new Error("datasource must be a text");

  if (!datasource?.includes("."))
    throw new Errror("datasource has wrong format string");

  const [dataset, table] = datasource.split(".");

  const model = bigquery.dataset(dataset).table(table);

  return {
    /**
     * Insert data method
     * @param {[string | number | object]} data Array of insert data
     * @returns {object} Object response
     */
    insert: (data) => insert(model, handleResponse, data),

    /**
     * Update data method
     * @param {object} data Object of update data
     * @param {object} filters Object of filters query
     * @returns {object} Object response
     */
    update: (data, filters) =>
      update(model, handleResponse, queryJoin, data, filters),

    /**
     * Delete data method
     * @param {Object} filters Object of filters query
     * @returns {Object} Object response
     */
    delete: (filters) => remove(model, handleResponse, queryJoin, filters),

    /**
     * Count rows method
     * @param {object} filters Object of filters query
     * @returns {object} Object response
     */
    count: (filters = null) => count(model, handleResponse, queryJoin, filters),

    /**
     * Find data method
     * @param {object} fields Object table fieldsname
     * @param {object} fitlers Object of filters query
     * @returns {object} Object response
     */
    find: (fields = null, filters = null) =>
      find(model, handleResponse, queryJoin, fields, filters),

    /** @TODO */
    max: () => {},

    /** @TODO */
    isExsists: () => {},

    /** @TODO */
    metadata: () => {},

    /** @TODO */
    create: () => {},
  };
};
