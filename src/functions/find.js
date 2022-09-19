/**
 * Find/Select wrapper function
 * @param {object} model Bigquery Model
 * @param {object} datasource Dataset & Table Name Objec
 * @param {function} handleResponse Handle Response function
 * @param {object} queryOptions Object of Query Options (Fields, Filters, Limit, Offset)
 * @returns {object} Object response
 */
export default async (model, datasource, handleResponse, queryOptions = {}) => {
  let query = `SELECT `;
  query += queryOptions?.fields ? queryOptions?.fields : "*";
  query += ` FROM \`${datasource.dataset}.${datasource.table}\``;

  if (queryOptions?.filters) query += ` WHERE ${queryOptions.filters}`;

  if (queryOptions?.orders) {
    query += ` ORDER BY ${
      queryOptions.orders?.key || queryOptions.orders || 1
    } ${queryOptions.orders?.type?.toUpperCase() || "ASC"}`;
  }

  if (queryOptions?.limit) query += ` LIMIT ${queryOptions.limit}`;

  if (queryOptions?.offset) query += ` OFFSET ${queryOptions.offset}`;

  // Create job query
  const [findJobs] = await model.createQueryJob({
    query,
    location: "asia-southeast1",
  });

  // Execute job query
  const [findProcess] = await findJobs.getQueryResults(findJobs).catch((e) => {
    throw e;
  });

  return handleResponse({
    query,
    process: {
      totalBytesProcessed: findJobs?.metadata?.statistics?.totalBytesProcessed,
      totalRows: findProcess?.length,
      data: findProcess?.[0],
    },
  });
};
