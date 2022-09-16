/**
 * Count wrapper function
 * @param {object} model Bigquery Model
 * @param {object} datasource Dataset & Table Name Object
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {object} filters Object of filters query
 * @returns {object} Object response
 */
export default async (
  model,
  datasource,
  handleResponse,
  queryJoin,
  filters
) => {
  if (!typeof datasource === "object" || !datasource)
    throw new Error("datasource is required and must be an object");

  if (!Object.keys(datasource)?.length)
    throw new Error("datasource must have fields");

  let query = `SELECT COUNT(*) as count FROM \`${datasource.dataset}.${datasource.table}\``;

  if (filters) {
    if (!typeof filters === "object")
      throw new Error("filters must be an object");

    if (!Object.keys(filters).keys()?.length)
      throw new Error("filters must have fields");

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
