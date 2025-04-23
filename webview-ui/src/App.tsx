import { parseLatestDataLines } from "observability-tools";
import { buildReport, Report } from "./report";
import { vscode } from "./utilities/vscode";
import { useEffect, useState, useCallback } from "react";

import PropertyView from "./PropertyView";
import Overview from "./Overview";
import Card from "./ui/Card";

type LoadDataCommand = {
  lines: string;
};

type AppState =
  | {
    state: "loading";
  }
  | {
    state: "ready";
    report: Report;
    property: string | null;
  };

type AppProps = {
  dataSourceURL?: string;
  simplifiedMode: boolean;
};

const App = (props: AppProps) => {
  const [state, setStateRaw] = useState<AppState>({ state: "loading" });
  const [shouldShowExplainer, setShouldShowExplainer] = useState<boolean>(true);

  const setState = useCallback(
    (newState: AppState) => {
      setStateRaw(newState);
    },
    [setStateRaw]
  );

  const loadData = useCallback(
    (command: LoadDataCommand) => {
      const lines = parseLatestDataLines(command.lines);
      if (typeof lines === "string") {
        console.error(lines);
        vscode.postMessage({
          command: "error",
          message: lines,
        });
        return;
      }
      const report = buildReport(lines);
      const properties = Object.keys(report.properties);
      const property = properties.length === 1 ? properties[0] :
        state.state === "ready" ? state.property : null;
      setState({
        state: "ready",
        report,
        property
      });
    },
    [state.state, (state as any).property, setState] // eslint-disable-line
  );

  const openEmpty = () => {
    setState({ state: "loading" });
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
        case "open-empty":
          openEmpty();
          break;
      }
    });
  });

  useEffect(() => {
    if (props.dataSourceURL && state.state === "loading") {
      console.log("Loading data from", props.dataSourceURL);
      fetch(props.dataSourceURL)
        .then((response) => response.text())
        .then((text) => {
          loadData({ lines: text });
        });
    }
  }, [props.dataSourceURL, loadData, state.state]);

  if (state.state === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Card className="">
          <label htmlFor="data-input" className="block font-bold mb-2">
            Visualize from File(s)
          </label>
          <input
            className="block font-sans rounded-md cursor-pointer focus:outline-none file:border-0 file:bg-primary file:text-white"
            multiple
            id="data-input"
            type="file"
            onChange={(e: any) => {
              const files: FileList = e.target.files;
              const reader = new FileReader();
              let lines = "";
              let i = 0;
              reader.onload = (e: any) => {
                lines = lines + "\n" + e.target.result;
                i++;
                loadData({ lines });
                if (i < files.length) {
                  reader.readAsText(files[i]);
                }
              };
              reader.readAsText(files[i]);
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="App max-w-xl mx-auto mb-10">
      <div className="fixed top-0 right-0 left-0 bg-primary py-2 px-3 h-10 flex justify-between items-center z-30">
        {state.state === "ready" && state.property === null && <div></div>}
        {state.state === "ready" && state.property !== null && (
          <button
            onClick={() => setState({ state: "ready", report: state.report, property: null })}
          >
            <i className="codicon codicon-arrow-left text-background" />
          </button>
        )}
        <span className="text-sm text-background">
          Last run {new Date(state.report.timestamp * 1000).toLocaleString()}
        </span>
      </div>
      <div className="p-1 mt-10">
        {shouldShowExplainer && (!props.simplifiedMode) && (
          <Card className="mb-1 text-sm">
            {state.property === null && <>
              <div className="text-lg font-bold mb-1 break-all leading-none">
                Tyche{" "}
              </div>
              <span className="">
                This page shows an overview of your last test execution. Properties are marked as
                passing (<i className="codicon codicon-check text-success" />), passing with
                warnings (<i className="codicon codicon-warning text-warning" />), or failing (<i
                  className="codicon codicon-x text-error" />).
              </span>
            </>}
            {state.property !== null && <>
              <div className="text-lg font-bold mb-1 break-all leading-none">
                Tyche{" "}
              </div>
              <span>
                This page shows charts that summarize the results of testing
                <span className="text-accent break-all"> {state.property}</span>.
                {/* High level statistics are always shown. If you want to visualize more granular
                distribution information, you can collect <span className="italic"> features</span>;
                consult the documentation for your PBT framework to learn how. */}
              </span>
            </>
            }
          </Card>
        )}
        {state.state === "ready" && state.property === null && (
          <Overview
            report={state.report}
            selectProperty={(property) =>
              setState({ state: "ready", report: state.report, property })
            }
            simplifiedMode={props.simplifiedMode}
          />
        )}
        {state.state === "ready" && state.property !== null && (
          <PropertyView
            testInfo={state.report.properties[state.property]}
            property={state.property}
            setShouldShowExplainer={setShouldShowExplainer}
            simplifiedMode={props.simplifiedMode}
            goBack={() => setState({ state: "ready", report: state.report, property: null })}
          />
        )}
      </div>
    </div >
  );
};

export default App;
