import {
  Tooltip,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { SampleInfo } from "../../src/datatypes";

type BucketChartProps = {
  bucketing: string;
  dataset: SampleInfo[];
};

export const BucketChart = (props: BucketChartProps) => {
  const buckets = Array.from(new Set(props.dataset.map((x) => x.bucketings[props.bucketing])));

  const bucketedData = buckets.map(
    (bucket) => ({
      name: `${props.bucketing} = ${bucket}`,
      value: props.dataset.filter((y) => y.bucketings[props.bucketing] === bucket).length
    })
  );

  return <div className="BucketChart">
    <div className="chart-title">
      Proportion <code>{props.bucketing}</code>
    </div>
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie dataKey="value" data={bucketedData} cx="40%" outerRadius={60}>
          <Cell key="cell-0" fill="#A3BE8C" />
          <Cell key="cell-1" fill="#D08770" />
          <Cell key="cell-2" fill="#88C0D0" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>;
}
