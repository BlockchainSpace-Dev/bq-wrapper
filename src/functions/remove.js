/**
 * Delete/Remove wrapper function
 * @param {object} model Bigquery Model
 * @param {function} handleResponse Handle Response function
 * @param {object} datasource Dataset & Table Name Object
 * @param {string} stringQueryFilters string of filters query
 * @returns {object} Object response
 */
export default async (
  model,
  datasource,
  handleResponse,
  stringQueryFilters
) => {
  if (!stringQueryFilters)
    throw new Error("string query filters must be exists");

  // Build delete query text
  let query = `DELETE FROM \`${datasource.dataset}.${datasource.table}\``;
  query += ` WHERE ${stringQueryFilters}`;

  // Create job query
  const [deleteJobs] = await model.createQueryJob({
    query,
    location: "asia-southeast1",
  });

  // Execute query
  const [deleteProcess] = await deleteJobs
    .getQueryResults(deleteJobs)
    .catch((e) => {
      throw e;
    });

  return handleResponse({
    query,
    process: {
      totalBytesProcessed:
        deleteJobs?.metadata?.statistics?.totalBytesProcessed,
      totalRows: deleteProcess?.length,
      data: deleteProcess?.[0],
    },
  });
};
