/**
 * Max wrapper function
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
  fieldname,
  stringQueryFilters
) => {
  if (typeof datasource !== "object" || !datasource)
    throw new Error("datasource is required and must be an object");

  if (!Object.keys(datasource)?.length)
    throw new Error("datasource must have fields");

  if (typeof fieldname !== "string" || !fieldname)
    throw new Error("fieldname must be a string and cannot be empty string");

  let query = `SELECT MAX(${fieldname}) as max FROM \`${datasource.dataset}.${datasource.table}\``;

  if (stringQueryFilters) {
    query += ` WHERE ${stringQueryFilters} `;
  }

  // Create job query
  const [maxJobs] = await model.createQueryJob({
    query,
    location: "asia-southeast1",
  });

  // Execute job query
  const [maxProcess] = await maxJobs.getQueryResults(maxJobs).catch((e) => {
    throw e;
  });

  return handleResponse({
    query,
    process: {
      totalBytesProcessed: maxJobs?.metadata?.statistics?.totalBytesProcessed,
      totalRows: maxProcess?.length,
      data: maxProcess?.[0],
    },
  });
};
