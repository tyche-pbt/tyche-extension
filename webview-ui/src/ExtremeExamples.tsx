import { VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { SampleInfo } from "./datatypes";
import { ExampleDOT } from "./ExampleDOT";

type ExtremeExamplesProps = {
  dataset: SampleInfo[];
  feature: string;
  filters: string[];
};

export const ExtremeExamples = (props: ExtremeExamplesProps) => {
  const [minFilter, setMinFilter] = useState("<none>");
  const [maxFilter, setMaxFilter] = useState("<none>");
  const [prettyView, setPrettyView] = useState(true);

  const dataset = (filter: string = "<none>"): SampleInfo[] => {
    if (filter === "<none>") {
      return props.dataset;
    }
    return props.dataset.filter((x) => x.filters[filter]);
  }

  const minByFeature = dataset(minFilter).reduce((acc, curr) => {
    return acc.features[props.feature] < curr.features[props.feature] ? acc : curr;
  }, dataset(minFilter)[0]);

  const maxByFeature = dataset(maxFilter).reduce((acc, curr) => {
    return acc.features[props.feature] > curr.features[props.feature] ? acc : curr;
  }, dataset(maxFilter)[0]);


  const viewItem = (item: SampleInfo) =>
    item.dot && prettyView ?
      <ExampleDOT dot={item.dot}></ExampleDOT>
      : <div><code>{item.item}</code></div>;

  return (
    <div className="ExtremeExamples">
      {props.dataset.length > 0 && props.dataset[0].dot &&
        <VSCodeButton className="view-toggle" onClick={() => setPrettyView(!prettyView)}>
          {prettyView ? "★" : "☆"}
        </VSCodeButton>
      }
      <div className="ee-title">
        Minimum by <code>{props.feature}</code>
        &nbsp;
        {props.filters.length > 0 &&
          <VSCodeDropdown value={minFilter} onChange={e => setMinFilter((e as any).target.value)}>
            <VSCodeOption value="<none>">none</VSCodeOption>
            {props.filters.map(x => <VSCodeOption value={x}>{x}</VSCodeOption>)}
          </VSCodeDropdown>}
      </div>
      <div className="ee-example">
        {viewItem(minByFeature)}
      </div>
      <div className="ee-title">
        Maximum by <code>{props.feature}</code>
        &nbsp;
        {props.filters.length > 0 &&
          <VSCodeDropdown value={maxFilter} onChange={e => setMaxFilter((e as any).target.value)}>
            <VSCodeOption value="<none>">none</VSCodeOption>
            {props.filters.map(x => <VSCodeOption value={x}>{x}</VSCodeOption>)}
          </VSCodeDropdown>}
      </div>
      <div className="ee-example">
        {viewItem(maxByFeature)}
      </div>
    </div>
  );
}
