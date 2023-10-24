import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  Bar
} from 'recharts';
import { SampleInfo } from "../../src/datatypes";

type BucketChartProps = {
  bucketing: string;
  dataset: SampleInfo[];
  viewValue: (v: string) => void;
};

export const BucketChart = (props: BucketChartProps) => {
  const buckets = Array.from(new Set(props.dataset.map((x) => x.bucketings[props.bucketing])));

  const bucketedData = [{
    name: props.bucketing,
    ...Object.fromEntries(buckets.map(
      (bucket) => ([
        `${bucket}`,
        props.dataset.filter((y) => y.bucketings[props.bucketing] === bucket).length,
      ]))),
  }];

  const colors = [
    "#A3BE8C",
    "#D08770",
    "#88C0D0",
    "#BF616A",
    "#EBCB8B",
    "#5E81AC",
  ];

  return <div className="BucketChart">
    <div className="chart-title">
      Categorized by <code>{props.bucketing}</code>
    </div>
    <ResponsiveContainer width="100%" height={120}>
      <BarChart
        width={800}
        height={100}
        data={bucketedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis type="number" domain={[0, props.dataset.length]} />
        <YAxis type="category" dataKey="name" hide={true} />
        <Tooltip />
        <Legend />
        {
          buckets.map(
            (bucket, i) =>
              <Bar dataKey={bucket} stackId="a" fill={colors[i % colors.length]} />
          )
        }
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
