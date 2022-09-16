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
      index % 1000 ? prev[prev.length - 1].push(next) : prev.push([next]);
      return prev;
    }, []);

    for (const insertData of batchData) {
      await model.insert(insertData).catch((e) => {
        throw e;
      });
    }
  } else {
    await model.insert(data).catch((e) => {
      throw e;
    });
  }

  return handleResponse({ process: { totalRows: data.length } });
};
