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
import { Drawer } from "./Drawer";

type BucketChartProps = {
  bucketing: string;
  dataset: SampleInfo[];
  viewValue: (v: string) => void;
};

export const BucketChart = (props: BucketChartProps) => {
  const buckets = Array.from(new Set(props.dataset.map((x) => x.bucketings[props.bucketing])));

  const bucketMap = Object.fromEntries(buckets.map(
    (bucket) => ([
      `${bucket}`,
      props.dataset.filter((y) => y.bucketings[props.bucketing] === bucket).length,
    ])));

  const bucketedData = [{
    name: props.bucketing,
    ...bucketMap,
  }];

  const heuristicAlert = (() => {
    if (props.bucketing === "outcome" && bucketMap["failed"] > 0) {
      return <span className="tooltip">
        <i className="codicon codicon-error icon-red tooltip" style={{ marginRight: "4px" }}></i>
        <div className="tooltip-text">
          This property has at least one <code>failed</code> sample.
        </div>
      </span>
    }
    if (props.bucketing === "outcome" && (bucketMap["gave_up"] / props.dataset.length) > 0.33) {
      return <span className="tooltip">
        <i className="codicon codicon-alert icon-yellow tooltip" style={{ marginRight: "4px" }}></i>
        <div className="tooltip-text">
          This property has a high ratio of <code>gave_up</code> samples.
        </div>
      </span>;
    }
  })();

  const color = (i: number, bucket: string) => {
    switch (bucket) {
      case "passed":
        return "#A3BE8C";
      case "failed":
        return "#BF616A";
      case "gave_up":
        return "#D08770";
    }
    const colors = [
      "#A3BE8C",
      "#D08770",
      "#88C0D0",
      "#BF616A",
      "#EBCB8B",
      "#5E81AC",
    ];
    return colors[i % colors.length];
  };

  return <div className="BucketChart">
    {heuristicAlert}
    Categorized by <code>{props.bucketing}</code>
    <Drawer open>
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
                <Bar
                  key={bucket}
                  dataKey={bucket}
                  stackId="a"
                  fill={color(i, bucket)}
                  onClick={() => props.viewValue(bucket)} />
            )
          }
        </BarChart>
      </ResponsiveContainer>
    </Drawer>
  </div>;
}
