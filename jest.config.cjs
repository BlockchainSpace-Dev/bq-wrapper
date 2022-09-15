/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
};

module.exports = config;
