/**
 * Query join method
 * @param {{ paramsObj: object, delimiters: string }} params Query join parameters options
 * @param {object} params.paramsObj
 * @param {string} params.delimiters
 * @param {string} params.operators
 * @returns {string}
 */
export default ({ paramsObj = {}, delimiters = "", type = "" }) =>
  Object.keys(paramsObj)?.length
    ? Object.entries(paramsObj)
        .reduce((prev, next) => {
          if (typeof next[1] === "string") {
            if (type === "select") {
              prev.push(`${next[0]} AS ${next[1]}`);
              return prev;
            }

            prev.push(`${next[0]} = "${next[1]}"`);
            return prev;
          }

          if (typeof next[1] === "boolean" && type === "select") {
            prev.push(`${next[0]}`);
            return prev;
          }

          // Default return
          prev.push(`${next[0]} = ${next[1]}`);
          return prev;
        }, [])
        .join(delimiters)
    : null;
