/**
 * Delete/Remove wrapper function
 * @param {object} model Bigquery Model
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {object} filters Object of filters query
 * @returns {object} Object response
 */
export default async (model, handleResponse, queryJoin, filters) => {
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
};
