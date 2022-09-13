/**
 * Count wrapper function
 * @param {object} model Bigquery Model
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {object} filters Object of filters query
 * @returns {object} Object response
 */
export default async (model, handleResponse, queryJoin, filters) => {
  let query = `SELECT COUNT(*) as count FROM \`${dataset}.${table}\``;

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
};
