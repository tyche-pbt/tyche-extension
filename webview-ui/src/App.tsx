import "./App.scss";

import { Report } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodePanelTab, VSCodePanelView, VSCodePanels, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import PropertyView from "./PropertyView";

type LoadDataCommand = {
  report: Report;
};

type AppProps = {};

type AppState = {
  state: "loading"
} | {
  state: "ready";
  report: Report;
};

const App = (_props: AppProps) => {
  const [state, setState] = useState<AppState>({ state: "loading" });

  const loadData = (command: LoadDataCommand) => {
    setState({
      state: "ready",
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
    return <div className="App">
      <VSCodeProgressRing style={{ margin: "100px auto" }} />
    </div>;
  }

  const keys = Object.keys(state.report.properties).sort();

  return (
    <div className="App">
      <VSCodePanels style={{ width: "100%" }}>
        {
          keys.map((propertyName: string, index: number) =>
            <VSCodePanelTab id={`tab-${index}`}>
              {propertyName}
            </VSCodePanelTab>
          )
        }
        {
          keys.map((propertyName: string, index: number) => {
            const info = state.report.properties[propertyName];
            return <VSCodePanelView id={`view-${index}`} style={{ width: "100%" }}>
              <PropertyView testInfo={info} property={propertyName} />
            </VSCodePanelView>;
          })
        }
      </VSCodePanels>
    </div>
  );
}

export default App;
