import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { SampleInfo } from "./datatypes";
import { PrettyExample } from "./PrettyExample";

type ExtremeExamplesProps = {
  dataset: SampleInfo[];
  feature: string;
  filters: string[];
};

export const ExtremeExamples = (props: ExtremeExamplesProps) => {
  const [minFilter, setMinFilter] = useState("<none>");
  const [maxFilter, setMaxFilter] = useState("<none>");

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

  return (
    <div className="ExtremeExamples">
      <div className="ee-container">
        <div className="ee-title">
          Minimum by <code>{props.feature}</code>
          &nbsp;
          {props.filters.length > 0 &&
            <VSCodeDropdown value={minFilter} onChange={e => setMinFilter((e as any).target.value)}>
              <VSCodeOption value="<none>">none</VSCodeOption>
              {props.filters.map(x => <VSCodeOption value={x}>{x}</VSCodeOption>)}
            </VSCodeDropdown>}
        </div>
        <PrettyExample example={minByFeature}></PrettyExample>
      </div>
      <div className="ee-container">
        <div className="ee-title">
          Maximum by <code>{props.feature}</code>
          &nbsp;
          {props.filters.length > 0 &&
            <VSCodeDropdown value={maxFilter} onChange={e => setMaxFilter((e as any).target.value)}>
              <VSCodeOption value="<none>">none</VSCodeOption>
              {props.filters.map(x => <VSCodeOption value={x}>{x}</VSCodeOption>)}
            </VSCodeDropdown>}
        </div>
        <PrettyExample example={maxByFeature}></PrettyExample>
      </div>
    </div>
  );
}
