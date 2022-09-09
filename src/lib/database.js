import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

const database = (datasource) => {
  const [dataset, table] = datasource.split(".");

  const model = bigquery.dataset(dataset).table(table);

  return {
    insert: async (data) => {
      if (!data?.length)
        throw new Error("Data must be an array and has a value");

      if (data.length > 1000) {
        const batchData = data.reduce((prev, next, index) => {
          if (index % 1000) {
            prev[prev.length - 1].push(next);
          } else {
            prev.push(next);
          }
          return prev;
        }, []);

        for (const insertData of batchData) {
          await model.insert(insertData).catch((e) => {
            throw e;
          });
        }

        return { status: "success", rows: data.length };
      }

      await model.insert(data).catch((e) => {
        throw e;
      });

      return { status: "success", rows: data.length };
    },
    update: () => {},
    delete: () => {},
    count: () => {},
    getLastData: () => {},
  };
};

export default database;
