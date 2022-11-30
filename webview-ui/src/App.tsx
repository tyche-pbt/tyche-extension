import * as React from "react";
import "./App.scss";

// import genTreeData from "./demo-data/genTree.json";
import { PageState, SampleInfo } from "./datatypes";
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

type AppProps = {};

const App = (_props: AppProps) => {

  const [loading, setLoading] = useState(true);
  const [genName, setGenName] = useState('');
  const [genSource, setGenSource] = useState('');
  const [dataset, setDataset] = useState<SampleInfo[]>([]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [pageView, setPageView] = useState<PageState>({ state: "main" });

  // const [loading, setLoading] = useState(false);
  // const [genName, setGenName] = useState("genTree");
  // const [genSource, setGenSource] = useState("Demo");
  // const [dataset, setDataset] = useState<SampleInfo[]>(genTreeData as SampleInfo[]);
  // const [activeFeatures, setActiveFeatures] = useState<string[]>(dataset.length > 0 ? Object.keys(dataset[0].features) : []);
  // const [activeFilters, setActiveFilters] = useState<string[]>(dataset.length > 0 ? Object.keys(dataset[0].filters) : []);

  const loadData = (command: LoadDataCommand) => {
    setDataset(command.dataset);
    setGenName(command.genName);
    setGenSource(command.genSource);
    setLoading(false);
    setActiveFeatures(command.dataset.length > 0 ? Object.keys(command.dataset[0].features) : []);
    setActiveFilters(command.dataset.length > 0 ? Object.keys(command.dataset[0].filters) : []);
  };

  const clearData = () => {
    setLoading(true);
  };

  const refreshData = () => {
    vscode.postMessage({ command: 'request-refresh-data' });
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
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

      {pageView.state === "main" && <MainView setPageView={setPageView} dataset={dataset} activeFeatures={activeFeatures} activeFilters={activeFilters} />}
      {pageView.state === "examples" && <ExampleView dataset={dataset}></ExampleView>}
      {pageView.state === "filtered" && <ExampleView dataset={dataset.filter((x) => {
        console.log(x.features[pageView.feature], pageView.value);
        return x.features[pageView.feature] === pageView.value;
      })}></ExampleView>}
    </div>
  );
}

export default App;
