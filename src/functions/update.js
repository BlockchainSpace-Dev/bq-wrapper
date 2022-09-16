/**
 * Update wrapper function
 * @param {object} model Bigquery Model
 * @param {object} datasource Dataset & Table Name Object
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {object} data Object of update data
 * @param {object} filters Object of filters query
 * @returns {object} Object response
 */
export default async (
  model,
  datasource,
  handleResponse,
  queryJoin,
  data,
  filters
) => {
  if (
    !typeof data === "object" ||
    !typeof filters === "object" ||
    !data ||
    !filters
  )
    throw new Error("data and filters must be an object");

  if (!Object.keys(data)?.length || !Object.keys(filters)?.length)
    throw new Error("data and filters must have fields");

  // Build update data params query text
  const updateData = queryJoin({ paramsObj: data, delimiters: "," });

  // Build filters data params query text
  const filtersData = queryJoin({
    paramsObj: filters,
    delimiters: ` AND `,
  });

  // Build update query text
  let query = `UPDATE \`${datasource.dataset}.${datasource.table}\` set ${updateData}`;
  query += ` WHERE ${filtersData}`;

  // Execute query
  const updateProcess = await model.query(query).catch((e) => {
    throw e;
  });

  return handleResponse({ query, process: updateProcess });
};
