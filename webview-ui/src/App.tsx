import * as React from "react";
import "./App.scss";

import { SampleInfo } from "./datatypes";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import genTreeData from "./demo-data/genTree.json";
import { MainView } from "./MainView";
import { ExampleView } from "./ExampleView";

type LoadDataCommand = {
  genName: string;
  dataset: SampleInfo[];
};

type AppProps = {};

const App = (_props: AppProps) => {
  // const [loading, setLoading] = useState(true);
  // const [genName, setGenName] = useState('');
  // const [dataset, setDataset] = useState<SampleInfo[]>([]);
  // const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  // const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [pageView, setPageView] = useState<"main" | "examples">("main");

  const [loading, setLoading] = useState(false);
  const [genName, setGenName] = useState("genTree");
  const [dataset, setDataset] = useState<SampleInfo[]>(genTreeData as SampleInfo[]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>(dataset.length > 0 ? Object.keys(dataset[0].features) : []);
  const [activeFilters, setActiveFilters] = useState<string[]>(dataset.length > 0 ? Object.keys(dataset[0].filters) : []);

  const loadData = (command: LoadDataCommand) => {
    setDataset(command.dataset);
    setGenName(command.genName);
    setLoading(false);
    setActiveFeatures(command.dataset.length > 0 ? Object.keys(command.dataset[0].features) : []);
    setActiveFilters(command.dataset.length > 0 ? Object.keys(command.dataset[0].filters) : []);
  };

  const refreshData = () => {
    vscode.postMessage({ command: 'request-refresh-data' });
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.command) {
        case 'load-data':
          loadData(message);
          break;
      }
    });
  });

  if (loading) {
    return <div className="App">
      <h3>Please select data source...</h3>
    </div>;
  }

  return (
    <div className="App">
      <div className="top-buttons">
        <VSCodeButton
          style={{ marginRight: "10px" }}
          onClick={() => pageView === "main" ? setPageView("examples") : setPageView("main")}
        >
          {pageView === "main" ? "See More Examples" : "Back to Main"}
        </VSCodeButton>
        <VSCodeButton onClick={refreshData}>
          ↺
        </VSCodeButton>
      </div>

      <div className="pane-title"><code>{genName}</code></div>

      {pageView === "main" && <MainView dataset={dataset} activeFeatures={activeFeatures} activeFilters={activeFilters} />}
      {pageView === "examples" && <ExampleView dataset={dataset}></ExampleView>}
    </div>
  );
}

export default App;
