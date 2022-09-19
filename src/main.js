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
      update(
        model,
        { dataset, table },
        handleResponse,
        queryJoin({ paramsObj: data }),
        queryJoin({ paramsObj: filters, delimiters: " AND " })
      ),

    /**
     * Delete data method
     * @param {Object} filters Object of filters query
     * @returns {Object} Object response
     */
    delete: (filters) =>
      remove(
        model,
        { dataset, table },
        handleResponse,
        queryJoin({ paramsObj: filters, delimiters: " AND " })
      ),

    /**
     * Count rows method
     * @param {object} filters Object of filters query
     * @returns {object} Object response
     */
    count: (filters = null) =>
      count(
        model,
        { dataset, table },
        handleResponse,
        queryJoin({ paramsObj: filters, delimiters: " AND " })
      ),

    /**
     * Find data method
     * @param {object} options Object table fieldsname
     * @returns {object} Object response
     */
    find: (options = {}) =>
      find(model, { dataset, table }, handleResponse, {
        fields: queryJoin({ paramsObj: options?.fields }),
        filters: queryJoin({
          paramsObj: options?.filters,
          delimiters: " AND ",
        }),
        limit: options?.limit,
        offset: options?.offset,
        orders: options?.orders,
      }),

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
