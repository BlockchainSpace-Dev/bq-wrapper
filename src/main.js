import { BigQuery } from "@google-cloud/bigquery";

// Initiate Bigquery instance
const bigquery = new BigQuery();

/**
 * Handle response object for output method
 * @param {{status: string, error: object, query: (string | null), process: object}} params Parameters options
 * @param {string} params.status Status output
 * @param {object} params.error Error output
 * @param {(string | null)} params.query Executed query text
 * @param {object} params.process Object response from query process
 * @param {number} params.process.totalRows Total rows inserted/affected
 * @param {number} params.process.totalBytesProcessed Total Bytes executed query
 * @returns {object} response object
 */
const handleResponse = ({
  status = "success",
  error = null,
  query = null,
  process = null,
}) => {
  return {
    status,
    error,
    query,
    totalRows: process?.totalRows || 0,
    totalBytesProcessed: process?.totalBytesProcessed || 0,
  };
};

/**
 * Query join method
 * @param {{ paramsObj: object, delimiters: string }} params Query join parameters options
 * @param {object} params.paramsObj
 * @param {string} params.delimiters
 * @returns {string}
 */
const queryJoin = ({ paramsObj = {}, delimiters = "" }) =>
  Object.keys(paramsObj)?.length
    ? Object.entries(paramsObj)
        .reduce((prev, next) => {
          const pushData =
            typeof next[1] === "string"
              ? `${next[0]} = "${next[1]}"`
              : `${next[0]} = ${next[1]}`;

          prev.push(pushData);

          return prev;
        }, [])
        .join(delimiters)
    : null;

/**
 * Repository constructor
 * @param {string} datasource
 * @returns {object}
 */
const main = (datasource) => {
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
    insert: async (data) => {
      if (!data?.length)
        throw new Error("Data must be an array object and has a value");

      if (data.length > 1000) {
        const batchData = data.reduce((prev, next, index) => {
          if (index % 1000) {
            prev[prev.length - 1].push(next);
          } else {
            prev.push(next);
          }
          return prev;
        }, []);

        let insertBatchProcess = [];

        for (const insertData of batchData) {
          insertBatchProcess.push(
            await model.insert(insertData).catch((e) => {
              throw e;
            })
          );
        }

        // Count total Bytes processed per batch
        insertBatchProcess = insertBatchProcess.reduce(
          (prev, next) => {
            if (next?.totalRows) prev.totalRows += next.totalRows;
            if (next?.totalBytesProcessed)
              prev.totalBytesProcessed += next.totalBytesProcessed;
            return prev;
          },
          {
            totalBytesProcessed: 0,
            totalRows: 0,
          }
        );

        return handleResponse({ process: insertBatchProcess });
      }

      const insertProcess = await model.insert(data).catch((e) => {
        throw e;
      });

      return handleResponse({ process: insertProcess });
    },

    /**
     * Update data method
     * @param {object} data
     * @param {object} filters
     * @returns {object}
     */
    update: async (data, filters) => {
      if (!typeof data === "object" || !typeof filters === "object")
        throw new Error("data and filters must be an object");

      // Build update data params query text
      const updateData = queryJoin({ paramsObj: data, delimiters: "," });

      // Build filters data params query text
      const filtersData = queryJoin({
        paramsObj: filters,
        delimiters: ` AND `,
      });

      // Build update query text
      let query = `UPDATE \`${dataset}.${table}\` set ${updateData}`;
      query += ` WHERE ${filtersData}`;

      // Execute query
      const updateProcess = await model.query(query).catch((e) => {
        throw e;
      });

      return handleResponse({ query, process: updateProcess });
    },

    /**
     * Delete data method
     * @param {Object} filters
     * @returns {Object}
     */
    delete: async (filters) => {
      if (!typeof filters === "object")
        return {
          status: failed,
          error: new Error("filters must be an object"),
          query: null,
        };

      // Build delete data params query text
      const filtersData = queryJoin({
        paramsObj: filters,
        delimiters: " AND ",
      });

      // Build delete query text
      let query = `DELETE FROM \`${dataset}.${table}\``;
      query += ` WHERE ${filtersData}`;

      // Execute query
      const deleteProcess = await model.query(query).catch((e) => {
        throw e;
      });

      return handleResponse({ query, process: deleteProcess });
    },

    /**
     *
     * @param {Object}
     * @param
     * @returns
     */
    count: async (filters = null) => {
      let query = `SELECT COUNT(*) FROM \`${dataset}.${table}\``;

      if (filters) {
        if (!typeof filters === "object")
          throw new Error("filters must be an object");

        const filtersData = queryJoin({
          paramsObj: filters,
          delimiters: " AND ",
        });

        query += ` WHERE ${filtersData} `;
      }

      const countProcess = await model.query(query).catch((e) => {
        throw e;
      });

      return handleResponse({ query, process: countProcess });
    },

    /** @TODO */
    max: () => {
      return handleResponse({});
    },
  };
};

// Default export
export default main;

// Export for unit testing purpose
export const units = {
  handleResponse,
  queryJoin,
};
