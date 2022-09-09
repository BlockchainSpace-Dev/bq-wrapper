import convict from "convict";

export const config = convict({
  project_id: {
    doc: "Project ID/Name that used for Bigquery process",
    format: String,
    default: "",
    sensitive: true,
  },
  bigquery: {
    credentials: {
      pathname: {
        doc: "Pathname of google application credentials",
        format: String,
        default: "credentials.json",
      },
      keyname: {
        doc: "Keyname of google application credentials",
        format: String,
        default: "GOOGLE_APPLICATION_CREDENTIALS",
      },
    },
  },
}).loadFile("./credentials.json");
