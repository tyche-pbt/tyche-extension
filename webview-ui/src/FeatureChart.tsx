import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { SampleInfo } from "../../src/datatypes";

type FeatureChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: number) => void;
};

export const FeatureChart = (props: FeatureChartProps) => {
  const { feature, viewValue } = props;

  const dataset = props.dataset;

  const featureData: { label: number; freq: number; }[] =
    Array.from(dataset.map((x) => Math.round(x.features[feature]))
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .sort(([a], [b]) => a - b)
      .map(([k, v]) => ({ label: k, freq: v }));

  return (
    <div className="FeatureChart">
      <div className="chart-title">
        Distribution of <code>{feature}</code>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={featureData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar onClick={(data) => viewValue(data.label)} dataKey="freq" fill="#B48EAD" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
