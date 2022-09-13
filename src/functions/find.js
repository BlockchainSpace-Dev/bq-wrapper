/**
 * Find/Select wrapper function
 * @param {object} model Bigquery Model
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {object} fields Object table fieldsname
 * @param {object} fitlers Object of filters query
 * @returns {object} Object response
 */
export default async (model, handleResponse, queryJoin, fields, filters) => {
  let fieldsData;
  let query = `SELECT`;

  if (fields) {
    if (!typeof fields === "object")
      throw new Error("fields must be an object");

    fieldsData = queryJoin({
      paramsObj: fields,
      delimiters: ",",
      type: "select",
    });
  }

  query += fieldsData ? fieldsData : " *";

  query += ` FROM \`${dataset}.${table}\``;

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
