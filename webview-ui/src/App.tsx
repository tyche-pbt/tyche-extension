import "./App.scss";

// import genTreeData from "./demo-data/genBST.json";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import { MainView } from "./MainView";
import { ExampleView } from "./ExampleView";

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
}

const App = (_props: AppProps) => {
  const [state, setState] = useState<AppState>({ state: "loading" });

  // const [state, setState] = useState<AppState>({
  //   state: "ready",
  //   testInfo: genTreeData as TestInfo,
  //   genName: "genTree",
  //   genSource: "Demo",
  // });

  const loadData = (command: LoadDataCommand) => {
    setState({
      state: "ready",
      testInfo: JSON.parse(command.testInfo),
      genName: command.genName,
      genSource: command.genSource,
    })
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

  const { testInfo, genName, genSource } = state;

  const features = Object.keys(testInfo.samples[0].features);
  const bucketings = Object.keys(testInfo.samples[0].bucketings);

  return (
    <div className="App">
      <div className="top-buttons">
        <VSCodeButton
          style={{ marginRight: "10px" }}
          onClick={() => pageView.state === "main" ? setPageView({ state: "examples" }) : setPageView({ state: "main" })}
        >
          {pageView.state === "main" ? "See More Examples" : "Back to Main"}
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
