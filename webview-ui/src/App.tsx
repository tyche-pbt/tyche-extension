import "./App.scss";

import { ExampleFilter, TestInfo, Report } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import { MainView } from "./MainView";
import { ExampleView } from "./ExampleView";
import { PrettyExample } from "./PrettyExample";

type LoadDataCommand = {
  genName: string;
  genSource: string;
  testInfo: string;
};

type PageState =
  { state: "main" }
  | { state: "examples" }
  | { state: "filtered", exampleFilter: ExampleFilter };

type AppProps = {};

type AppState = {
  state: "loading"
} | {
  state: "ready";
  testInfo: TestInfo;
  genName: string;
  genSource: string;
} | {
  state: "error";
  message: string;
};

const App = (_props: AppProps) => {
  const [state, setState] = useState<AppState>({ state: "loading" });

  const loadData = (command: LoadDataCommand) => {
    try {
      const report = JSON.parse(command.testInfo) as Report;
      setState({
        state: "ready",
        testInfo: report.tests[0].info,
        genName: command.genName,
        genSource: command.genSource,
      });
    } catch (e) {
      setState({ state: "error", message: "Failed to parse report." });
    }
  };

  const clearData = () => {
    setState({ state: "loading" });
  };

  const refreshData = () => {
    vscode.postMessage({ command: "request-refresh-data" });
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


  const [pageView, setPageView] = useState<PageState>({ state: "main" });

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

  const { testInfo, genName, genSource } = state;

  if (testInfo.type && testInfo.type === "failure") {
    return <div className="App">
      <div className="pane-title">
        <code title={genSource}>{genName}</code>: Found Counterexample
      </div>
      The property failed with the following counterexample:
      <PrettyExample example={testInfo.counterExample} />
      and the following error:
      <pre>{testInfo.message}</pre>
    </div>;
  }

  if (testInfo.type && testInfo.type === "error") {
    return <div className="App">
      Something went wrong. The test runner failed with the following error:
      <pre>{testInfo.message}</pre>
    </div>;
  }

  const features = Object.keys(testInfo.samples[0].features);
  const bucketings = Object.keys(testInfo.samples[0].bucketings);

  return (
    <div className="App">
      <div className="top-buttons">
        <VSCodeButton
          style={{ marginRight: "10px" }}
          onClick={() => pageView.state === "main" ? setPageView({ state: "examples" }) : setPageView({ state: "main" })}
        >
          {pageView.state === "main" ? "See More Examples" : "Back to Overview"}
        </VSCodeButton>
        <VSCodeButton onClick={refreshData}>
          ↺
        </VSCodeButton>
      </div>

      <div className="pane-title">
        <code title={genSource}>{genName}</code>
      </div>

      {pageView.state === "main" &&
        <MainView
          setFilteredView={(f) => setPageView({ state: "filtered", exampleFilter: f })}
          coverage={testInfo.coverage}
          dataset={testInfo.samples}
          features={features}
          bucketings={bucketings}
        />}
      {pageView.state === "examples" && <ExampleView dataset={testInfo.samples} />}
      {pageView.state === "filtered" && <ExampleView dataset={testInfo.samples} filter={pageView.exampleFilter} />}
    </div>
  );
}

export default App;
