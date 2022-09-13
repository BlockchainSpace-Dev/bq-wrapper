import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

/**
 * Repository constructor
 * @param {text} datasource
 * @returns {Object}
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
     * @param {Array} data
     * @returns {Object}
     */
    insert: async (data) => {
      if (!data?.length)
        return {
          status: "failed",
          error: new Error("Data must be an array object and has a value"),
          query: null,
        };

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
              return {
                status: "failed",
                error: e,
                query: null,
              };
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

        return {
          status: "success",
          totalRows: insertBatchProcess?.totalRows || 0,
          totalBytesProcessed: insertBatchProcess?.totalBytesProcessed || 0,
          query: null,
        };
      }

      const insertProcess = await model.insert(data).catch((e) => {
        return {
          status: "failed",
          error: e,
          query: null,
        };
      });

      return {
        status: "success",
        totalRows: insertProcess?.totalRows,
        totalBytesProcessed: insertProcess?.totalBytesProcessed,
        query: null,
      };
    },

    /**
     * Update data method
     * @param {Object} data
     * @param {Object} filters
     * @returns {Object}
     */
    update: async (data, filters) => {
      if (!typeof data === "object" || !typeof filters === "object")
        return {
          status: failed,
          error: new Error("data and filters must be an object"),
          query: null,
        };

      // Build update data params query text
      const updateData = Object.entries(data).reduce((prev, next) => {
        const pushData =
          typeof next === "string"
            ? `${next[0]} = "${next[1]}"`
            : `${next[0]} = ${next[1]}`;

        prev.push(pushData);

        return prev;
      }, []);

      // Build filters data params query text
      const filtersData = Object.entries(filters).reduce((prev, next) => {
        const pushData =
          typeof next === "string"
            ? `${next[0]} = "${next[1]}"`
            : `${next[0]} = ${next[1]}`;

        prev.push(pushData);

        return prev;
      }, []);

      // Build update query text
      let query = `UPDATE \`${dataset}.${table}\` set ${updateData.join(",")}`;
      query += ` WHERE ${filtersData.join(` AND `)}`;

      // Execute query
      const updateProcess = await model.query(query).catch((e) => {
        return {
          status: "failed",
          error: e,
          query,
        };
      });

      return {
        status: "success",
        totalRows: updateProcess?.totalRows || 0,
        totalBytesProcessed: updateProcess?.totalBytesProcessed || 0,
        query,
      };
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
      const filtersData = Object.entries(filters).reduce((prev, next) => {
        const pushData =
          typeof next === "string"
            ? `${next[0]} = "${next[1]}"`
            : `${next[0]} = ${next[1]}`;

        prev.push(pushData);

        return prev;
      }, []);

      // Build delete query text
      let query = `DELETE FROM \`${dataset}.${table}\``;
      query += ` WHERE ${filtersData.join(` AND `)}`;

      // Execute query
      const deleteProcess = await model.query(query).catch((e) => {
        return { status: "failed", error: e, query };
      });

      return {
        status: "success",
        totalRows: deleteProcess?.totalRows || 0,
        totalBytesProcessed: deleteProcess?.totalBytesProcessed || 0,
        query,
      };
    },

    count: () => {},

    getLastData: () => {},
  };
};

export default main;
