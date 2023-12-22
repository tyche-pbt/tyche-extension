import "./App.scss";

import { Report } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import PropertyView from "./PropertyView";
import Overview from "./Overview";

type LoadDataCommand = {
  report: Report;
};

type AppState = {
  state: "loading"
} | {
  state: "overview";
  report: Report;
} | {
  state: "selected";
  report: Report;
  property: string;
};

const App = () => {
  // const [state, setState] = useState<AppState>({ state: "loading" });
  const [state, setState] = useState<AppState>({ state: "selected", report: require("./report.json"), property: "bst_tests.py::test_insert_valid" });

  const loadData = (command: LoadDataCommand) => {
    setState({
      state: "overview",
      report: command.report,
    });
  };

  const clearData = () => {
    setState({ state: "loading" });
  };

  useEffect(() => {
    // NOTE: This `return` is critical. It tells React to clean up the listener on re-renders.
    return vscode.onMessage((event) => {
      const message = event.data;
      switch (message.command) {
        case "load-data":
          loadData(message);
          break;
        case "clear-data":
          clearData();
          break;
      }
    });
  });

  if (state.state === "loading") {
    return <div className="App w-full m-0 p-0 relative">
      <VSCodeProgressRing className="mt-64 my-auto" />
    </div>;
  }

  return (
    <div className="App">
      <div className="fixed top-0 right-0 left-0 bg-slate-500 p-1 h-10 flex justify-between items-center">
        {state.state === "selected" ?
          <button onClick={() => setState({ state: "overview", report: state.report })}>
            <i className="codicon codicon-arrow-left text-white" />
          </button> :
          <div></div>
        }
        <span className="text-sm text-white">
          {new Date(state.report.timestamp * 1000).toLocaleString()}
        </span>
      </div>
      <div className="p-1 mt-10">
        {state.state === "overview" &&
          <Overview report={state.report} selectProperty={(property) => setState({ state: "selected", report: state.report, property })} />}
        {state.state === "selected" &&
          <PropertyView testInfo={state.report.properties[state.property]} property={state.property} />
        }
      </div>
    </div >
  );
}

export default App;
