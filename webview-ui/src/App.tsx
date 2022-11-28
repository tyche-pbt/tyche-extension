import * as React from "react";
import "./App.scss";

import { FeatureChart } from "./FeatureChart";
import { FilterChart } from "./FilterChart";
import { ExtremeExamples } from "./ExtremeExamples";
import { SampleInfo } from "./datatypes";
import { HighLevelStats } from "./HighLevelStats";
import { vscode } from "./utilities/vscode";
import { useEffect, useState } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import genTreeData from "./demo-data/genTree.json";

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
      <VSCodeButton className="refresh-button" onClick={refreshData}>
        ↺
      </VSCodeButton>

      <div className="pane-title"><code>{genName}</code></div>

      <HighLevelStats dataset={dataset} />

      {activeFeatures.map((x) =>
        <div>
          <FeatureChart
            feature={x}
            dataset={dataset}
            filters={activeFilters}
          ></FeatureChart>

          <ExtremeExamples
            feature={x}
            dataset={dataset}
            filters={activeFilters}
          ></ExtremeExamples>
        </div>
      )}

      {activeFilters.map((x) =>
        <FilterChart filter={x} dataset={dataset}></FilterChart>
      )}
    </div>
  );
}

export default App;
