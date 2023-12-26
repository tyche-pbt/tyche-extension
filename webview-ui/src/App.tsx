import { Report } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";

import PropertyView from "./PropertyView";
import Overview from "./Overview";
import Card from "./ui/Card";

type LoadDataCommand = {
  report: Report;
};

type AppState = {
  state: "loading"
} | {
  state: "ready";
  report: Report;
  property: string | null;
};

const App = () => {
  const [state, setStateRaw] = useState<AppState>({ state: "loading" });
  // const [state, setStateRaw] = useState<AppState>({ state: "ready", report: require("./report.json"), property: null /*"bst_tests.py::test_insert_post"*/ });
  const [shouldShowExplainer, setShouldShowExplainer] = useState<boolean>(true);

  const setState = (newState: AppState) => {
    setStateRaw(newState);
    if (vscode.isVSCode()) {
      vscode.setState(newState);
    }
  };

  const loadData = (command: LoadDataCommand) => {
    setState({
      state: "ready",
      report: command.report,
      property: state.state === "ready" ? state.property : null,
    });
  };

  useEffect(() => {
    if (vscode.isVSCode()) {
      const state = vscode.getState();
      if (state) {
        setStateRaw(state as AppState);
      }
    }
  }, [state]);

  useEffect(() => {
    // NOTE: This `return` is critical. It tells React to clean up the listener on re-renders.
    return vscode.onMessage((event) => {
      const message = event.data;
      switch (message.command) {
        case "load-data":
          loadData(message);
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
      <div className="fixed top-0 right-0 left-0 bg-primary py-2 px-3 h-10 flex justify-between items-center z-30">
        {state.state === "ready" && state.property === null &&
          <div></div>}
        {state.state === "ready" && state.property !== null &&
          <button onClick={() => setState({ state: "ready", report: state.report, property: null })}>
            <i className="codicon codicon-arrow-left text-background" />
          </button>}
        <span className="text-sm text-background">
          Last run {new Date(state.report.timestamp * 1000).toLocaleString()}
        </span>
      </div>
      <div className="p-1 mt-10">
        {shouldShowExplainer &&
          <Card className="mb-1 text-sm">
            <div className="text-lg font-bold mb-1 break-all">
              Tyche {state.property !== null && <span className="font-normal text-base text-accent">/ {state.property}</span>}
            </div>
            <span className="">
              Tyche helps you understand the effectiveness of your property-based testing.&nbsp;
              {state.property === null
                ? <>
                  This page shows an overview of your last test execution. Properties are marked as
                  passing (<i className="codicon codicon-check text-success" />),
                  passing with warnings (<i className="codicon codicon-warning text-warning" />),
                  or failing (<i className="codicon codicon-x text-error" />).
                </>
                : <>
                  This page shows detailed information about the samples that were used to test
                  <span className="text-accent break-all"> {state.property}</span>.
                  High level statistics are always shown. If you want to visualize
                  more granular distribution information, you can collect
                  <span className="italic"> features</span>; consult the documentation for your PBT
                  framework to learn how.
                </>
              }
              <div className="w-full text-right mt-1 text-base">
                <a href="https://github.com/tyche-pbt/tyche-extension" className="text-primary">Learn More</a>
              </div>
            </span>
          </Card>}
        {state.state === "ready" && state.property === null &&
          <Overview report={state.report} selectProperty={(property) => setState({ state: "ready", report: state.report, property })} />}
        {state.state === "ready" && state.property !== null &&
          <PropertyView
            testInfo={state.report.properties[state.property]}
            property={state.property}
            setShouldShowExplainer={setShouldShowExplainer}
          />}
      </div>
    </div >
  );
}

export default App;
