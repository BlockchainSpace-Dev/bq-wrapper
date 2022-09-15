/**
 * Query join method
 * @param {{ paramsObj: object, delimiters: string }} params Query join parameters options
 * @param {object} params.paramsObj
 * @param {string} params.delimiters
 * @param {string} params.operators
 * @returns {(string | null)}
 */
export default ({ paramsObj = {}, delimiters = ",", operators = "=" } = {}) =>
  Object.keys(paramsObj)?.length
    ? Object.entries(paramsObj)
        .reduce((prev, next) => {
          if (["as", "AS"].includes(operators)) {
            if (typeof next[1] === "string") {
              prev.push(`${next[0]} ${operators} ${next[1]}`);
              return prev;
            }

            if (typeof next[1] === "boolean") {
              prev.push(`${next[0]}`);
              return prev;
            }
          }

          if (typeof next[1] === "string") {
            prev.push(`${next[0]} ${operators} "${next[1]}"`);
            return prev;
          }

          // Default return
          prev.push(`${next[0]} = ${next[1]}`);
          return prev;
        }, [])
        .join(delimiters)
    : null;
