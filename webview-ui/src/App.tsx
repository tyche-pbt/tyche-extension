import "./App.scss";

import { TestInfo, Report } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodePanelTab, VSCodePanelView, VSCodePanels, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import PropertyView from "./PropertyView";

type LoadDataCommand = {
  report: string;
};

type AppProps = {};

type AppState = {
  state: "loading"
} | {
  state: "ready";
  report: Report;
} | {
  state: "error";
  message: string;
};

const App = (_props: AppProps) => {
  const [state, setState] = useState<AppState>({ state: "loading" });

  const loadData = (command: LoadDataCommand) => {
    try {
      const old_report = state.state === "ready" ? state.report : {};
      const report = JSON.parse(command.report) as Report;
      setState({
        state: "ready",
        report: { ...old_report, ...report },
      });
    } catch (e) {
      setState({ state: "error", message: "Failed to parse report." });
    }
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
    return <div className="App">
      <VSCodeProgressRing style={{ margin: "100px auto" }} />
    </div>;
  }

  if (state.state === "error") {
    return <div className="App">
      Something went wrong. The test runner failed with the following error:
      <pre>{state.message}</pre>
    </div>;
  }

  return (
    <div className="App">
      <VSCodePanels style={{ width: "100%" }}>
        {
          Object.keys(state.report).map((propertyName: string, index: number) =>
            <VSCodePanelTab id={`tab-${index}`}>
              {propertyName}
            </VSCodePanelTab>
          )
        }
        {
          Object.values(state.report).map((info: TestInfo, index: number) =>
            <VSCodePanelView id={`view-${index}`} style={{ width: "100%" }}>
              <PropertyView testInfo={info} />
            </VSCodePanelView>
          )
        }
      </VSCodePanels>
    </div>
  );
}

export default App;
