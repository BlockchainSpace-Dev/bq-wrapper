/**
 * Update wrapper function
 * @param {object} model Bigquery Model
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {object} data Object of update data
 * @param {object} filters Object of filters query
 * @returns {object} Object response
 */
export default async (model, handleResponse, queryJoin, data, filters) => {
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
};
