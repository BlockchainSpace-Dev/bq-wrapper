/**
 * Insert wrapper functions
 * @param {object} model Bigquery Model
 * @param {function} handleResponse Handle Response function
 * @param {[string | number | object]} data Array of insert data
 * @returns {object} Object response
 */
export default async (model, handleResponse, data) => {
  if (!data?.length)
    throw new Error("Data must be an array object and has a value");

  if (data.length > 1000) {
    const batchData = data.reduce((prev, next, index) => {
      if (index % 1000) {
        prev[prev.length - 1].push(next);
      } else {
        prev.push(next);
      }
      return prev;
    }, []);

    let insertBatchProcess = [];

    for (const insertData of batchData) {
      insertBatchProcess.push(
        await model.insert(insertData).catch((e) => {
          throw e;
        })
      );
    }

    // Count total Bytes processed per batch
    insertBatchProcess = insertBatchProcess.reduce(
      (prev, next) => {
        if (next?.totalRows) prev.totalRows += next.totalRows;
        if (next?.totalBytesProcessed)
          prev.totalBytesProcessed += next.totalBytesProcessed;
        return prev;
      },
      {
        totalBytesProcessed: 0,
        totalRows: 0,
      }
    );

    return handleResponse({ process: insertBatchProcess });
  }

  const insertProcess = await model.insert(data).catch((e) => {
    throw e;
  });

  return handleResponse({ process: insertProcess });
};
