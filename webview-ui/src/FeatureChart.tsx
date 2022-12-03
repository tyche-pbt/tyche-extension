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
  filter?: string;
  viewValue: (v: number) => void;
};

export const FeatureChart = (props: FeatureChartProps) => {
  const { feature, filter, viewValue } = props;

  const dataset = filter ? props.dataset.filter((x) => x.filters[filter]) : props.dataset;

  const featureData: { name: string; freq: number; }[] =
    Array.from(dataset.map((x) => Math.round(x.features[feature]))
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .sort(([a], [b]) => a - b)
      .map(([k, v]) => ({ name: k.toString(), freq: v }));

  return (
    <div className="FeatureChart">
      <div className="chart-title">
        Distribution of <code>{feature}</code>{filter && <span> (filtered by <code>{filter}</code>)</span>}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={featureData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar onClick={(data) => viewValue(parseInt(data.name))} dataKey="freq" fill="#B48EAD" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
