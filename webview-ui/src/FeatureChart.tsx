import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { SampleInfo } from "../../src/datatypes";
import { Drawer } from "./Drawer";
import { THEME_COLORS } from "./colors";

type FeatureChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: number) => void;
};

export const FeatureChart = (props: FeatureChartProps) => {
  const { feature, viewValue } = props;

  const dataset = props.dataset;

  const featureData: { label: number; freq: number; }[] =
    Array.from(dataset.filter(x => x.features.numerical[feature] !== undefined).map((x) => Math.round(x.features.numerical[feature]))
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .map(([k, v]) => ({ label: k, freq: v }));

  const maxLabel = Math.max(...featureData.map((x) => x.label));
  const minLabel = Math.min(...featureData.map((x) => x.label));
  for (let i = minLabel; i <= maxLabel; i++) {
    if (!featureData.find((x) => x.label === i)) {
      featureData.push({ label: i, freq: 0 });
    }
  }
  featureData.sort((x, y) => x.label - y.label);

  return (
    <div className="FeatureChart">
      Distribution of <code>{feature}</code>
      <Drawer open>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={featureData}
            margin={{ top: 20, right: 20 }}
          >
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar onClick={(data) => viewValue(data.label)} dataKey="freq" fill={THEME_COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </Drawer>
    </div>
  );
}
