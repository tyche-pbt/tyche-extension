import { Report } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";

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
  const [state, setState] = useState<AppState>({ state: "selected", report: require("./report.json"), property: "bst_tests.py::test_insert_post" });

  const loadData = (command: LoadDataCommand) => {
    setState({
      state: "overview",
      report: command.report,
    });
    console.log(JSON.stringify(command.report, undefined, 2));
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
    return <div className="App w-8 mx-auto mt-16">
      <div role="status" className="">
        <svg aria-hidden="true" className="w-8 h-8 text-background animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>;
  }

  return (
    <div className="App">
      <div className="fixed top-0 right-0 left-0 bg-primary py-2 px-3 h-10 flex justify-between items-center">
        {state.state === "selected" ?
          <button onClick={() => setState({ state: "overview", report: state.report })}>
            <i className="codicon codicon-arrow-left text-background" />
          </button> :
          <div></div>
        }
        <span className="text-sm text-background">
          Run: {new Date(state.report.timestamp * 1000).toLocaleString()}
        </span>
      </div>
      <div className="p-1 mt-10">
        {state.state === "overview" &&
          <Overview report={state.report} selectProperty={(property) => setState({ state: "selected", report: state.report, property })} />}
        {state.state === "selected" &&
          <PropertyView testInfo={state.report.properties[state.property]} property={state.property} />}
      </div>
    </div >
  );
}

export default App;
