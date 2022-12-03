import "./App.scss";

import genTreeData from "./demo-data/genTree.json";
import { SampleInfo } from "./datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import { MainView } from "./MainView";
import { ExampleView } from "./ExampleView";

type LoadDataCommand = {
  genName: string;
  genSource: string;
  dataset: SampleInfo[];
};

type PageState =
  { state: "main" }
  | { state: "examples" }
  | { state: "filtered", feature: string, value: number };

type AppProps = {};

type AppState = {
  loading: boolean;
  dataset: SampleInfo[];
  genName: string;
  genSource: string;
}

const App = (_props: AppProps) => {
  // const [state, setState] = useState<AppState>({
  //   loading: true,
  //   dataset: [],
  //   genName: "",
  //   genSource: ""
  // });

  const [state, setState] = useState<AppState>({
    loading: false,
    dataset: genTreeData as SampleInfo[],
    genName: "genTree",
    genSource: "Demo",
  });

  const { loading, dataset, genName, genSource } = state;

  const [pageView, setPageView] = useState<PageState>({ state: "main" });

  const activeFeatures = dataset.length > 0 ? Object.keys(dataset[0].features) : [];
  const activeFilters = dataset.length > 0 ? Object.keys(dataset[0].filters) : [];

  const loadData = (command: LoadDataCommand) => {
    setState({
      loading: false,
      dataset: command.dataset,
      genName: command.genName,
      genSource: command.genSource,
    })
  };

  const clearData = () => {
    setState({
      loading: true,
      dataset: [],
      genName: "",
      genSource: "",
    });
  };

  const refreshData = () => {
    vscode.postMessage({ command: "request-refresh-data" });
  };

  useEffect(() => {
    window.addEventListener("message", (event) => {
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

  if (loading) {
    return <div className="App">
      <VSCodeProgressRing style={{ margin: "100px auto" }} />
    </div>;
  }

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
          setFilteredView={(f, v) => setPageView({ state: "filtered", feature: f, value: v })}
          dataset={dataset}
          activeFeatures={activeFeatures}
          activeFilters={activeFilters}
        />}
      {pageView.state === "examples" && <ExampleView dataset={dataset}></ExampleView>}
      {pageView.state === "filtered" && <ExampleView dataset={dataset.filter((x) => {
        console.log(x.features[pageView.feature], pageView.value);
        return x.features[pageView.feature] === pageView.value;
      })}></ExampleView>}
    </div>
  );
}

export default App;
