/**
 * Handle response object for output method
 * @param {{status: string, error: object, query: (string | null), process: object}} params Parameters options
 * @param {string} params.status Status output
 * @param {object} params.error Error output
 * @param {(string | null)} params.query Executed query text
 * @param {object} params.process Object response from query process
 * @param {number} params.process.totalRows Total rows inserted/affected
 * @param {number} params.process.totalBytesProcessed Total Bytes executed query
 * @returns {object} response object
 */
export default ({
  status = "success",
  error = null,
  query = null,
  process = null,
} = {}) => {
  return {
    status,
    error,
    query,
    totalRows: process?.totalRows || 0,
    totalBytesProcessed: process?.totalBytesProcessed || 0,
  };
};
