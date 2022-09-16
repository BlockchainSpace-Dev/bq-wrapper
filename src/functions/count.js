/**
 * Count wrapper function
 * @param {object} model Bigquery Model
 * @param {object} datasource Dataset & Table Name Object
 * @param {function} handleResponse Handle Response function
 * @param {string} stringQueryFilters String of filters query
 * @returns {object} Object response
 */
export default async (
  model,
  datasource,
  handleResponse,
  stringQueryFilters
) => {
  if (typeof datasource !== "object" || !datasource)
    throw new Error("datasource is required and must be an object");

  if (!Object.keys(datasource)?.length)
    throw new Error("datasource must have fields");

  let query = `SELECT COUNT(*) as count FROM \`${datasource.dataset}.${datasource.table}\``;

  if (stringQueryFilters) {
    query += ` WHERE ${stringQueryFilters} `;
  }

  // Create job query
  const [countJobs] = await model.createQueryJob({
    query,
    location: "asia-southeast1",
  });

  // Execute job query
  const [countProcess] = await countJobs
    .getQueryResults(countJobs)
    .catch((e) => {
      throw e;
    });

  return handleResponse({
    query,
    process: {
      totalBytesProcessed: countJobs?.metadata?.statistics?.totalBytesProcessed,
      totalRows: countProcess?.length,
      data: countProcess?.[0],
    },
  });
};
