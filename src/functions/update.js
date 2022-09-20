/**
 * Update wrapper function
 * @param {object} model Bigquery Model
 * @param {object} datasource Dataset & Table Name Object
 * @param {function} handleResponse Handle Response function
 * @param {function} queryJoin Query Join function
 * @param {string} stringQueryData string of list update data
 * @param {string} stringQueryFilters string of filters query
 * @returns {object} Object response
 */
export default async (
  model,
  datasource,
  handleResponse,
  stringQueryData,
  stringQueryFilters
) => {
  if (!stringQueryData || !stringQueryFilters)
    throw new Error(
      "string query data and string query filters must be exists"
    );

  // Build update query text
  let query = `UPDATE \`${datasource.dataset}.${datasource.table}\` set ${stringQueryData}`;
  query += ` WHERE ${stringQueryFilters}`;

  // Create job query
  const [updateJobs] = await model
    .createQueryJob({
      query,
      location: "asia-southeast1",
    })
    .catch((e) => {
      throw e;
    });

  // Execute job query
  const [updateProcess] = await updateJobs
    .getQueryResults(updateJobs)
    .catch((e) => {
      throw e;
    });

  return handleResponse({
    query,
    process: {
      totalBytesProcessed:
        updateJobs?.metadata?.statistics?.totalBytesProcessed,
      totalRows: updateProcess?.length,
      data: updateProcess?.[0],
    },
  });
};
