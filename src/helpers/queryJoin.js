/**
 * Query join method
 * @param {{ paramsObj: object, delimiters: string }} params Query join parameters options
 * @param {object} params.paramsObj
 * @param {string} params.delimiters
 * @param {string} params.operators
 * @returns {(string | null)}
 */
export default ({ paramsObj = {}, delimiters = "," } = {}) =>
  Object.keys(paramsObj)?.length
    ? Object.entries(paramsObj)
        .reduce((prev, next) => {
          if (typeof next[1] === "object" && Object.keys(next[1]).length) {
            prev.push(
              `${next[0]} ${next[1]?.operators || "="} ${
                next[1]?.value || null
              }`
            );
            return prev;
          }

          if (typeof next[1] === "string") {
            prev.push(`${next[0]} = "${next[1]}"`);
            return prev;
          }

          if (typeof next[1] === "boolean") {
            prev.push(`${next[0]}`);
            return prev;
          }

          prev.push(`${next[0]} = ${next[1]}`);
          return prev;
        }, [])
        .join(delimiters)
    : null;
