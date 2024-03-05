import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "@vscode/codicons/dist/codicon.css";
import "./index.scss";

let dataSourceURL: string | undefined;
if (document && document.location && document.location.search) {
  const maybeDataSourceUrl = new URLSearchParams(document.location.search).get("dataSourceURL");
  if (maybeDataSourceUrl) {
    dataSourceURL = decodeURI(maybeDataSourceUrl);
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App dataSourceURL={dataSourceURL} />
  </React.StrictMode>,
  document.getElementById("root")
);
