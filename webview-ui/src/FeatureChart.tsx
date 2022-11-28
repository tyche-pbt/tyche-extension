import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import * as React from "react";
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { SampleInfo } from "./datatypes";

type FeatureChartProps = {
  feature: string;
  dataset: SampleInfo[];
  filters: string[];
};

export const FeatureChart = (props: FeatureChartProps) => {
  const [filter, setFilter] = React.useState("<none>");

  const dataset = (filter: string = "<none>"): SampleInfo[] => {
    if (filter === "<none>") {
      return props.dataset;
    }
    return props.dataset.filter((x) => x.filters[filter]);
  }

  const featureData: { name: string; freq: number; }[] =
    Array.from(dataset(filter).map((x) => Math.round(x.features[props.feature]))
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .sort(([a], [b]) => a - b)
      .map(([k, v]) => ({ name: k.toString(), freq: v }));

  return (
    <div className="FeatureChart">
      <div className="chart-title">
        Distribution of <code>{props.feature}</code>
        &nbsp;
        {props.filters.length > 0 &&
          <VSCodeDropdown value={filter} onChange={e => setFilter((e as any).target.value)}>
            <VSCodeOption value="<none>">none</VSCodeOption>
            {props.filters.map(x => <VSCodeOption value={x}>{x}</VSCodeOption>)}
          </VSCodeDropdown>}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={featureData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="freq" fill="#B48EAD" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
