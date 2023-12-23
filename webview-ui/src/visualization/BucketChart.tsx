import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  Bar
} from 'recharts';
import { SampleInfo } from "../../../src/datatypes";
import { Drawer } from "../ui/Drawer";
import { THEME_COLORS } from "../utilities/colors";

type BucketChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: string) => void;
};

export const BucketChart = (props: BucketChartProps) => {
  const buckets = Array.from(new Set(props.dataset.map((x) => x.features.categorical[props.feature])));

  const bucketMap = Object.fromEntries(buckets.map(
    (bucket) => ([
      `${bucket}`,
      props.dataset.filter((y) => y.features.categorical[props.feature] === bucket).length,
    ])));

  const bucketedData = [{
    name: props.feature,
    ...bucketMap,
  }];

  const heuristicAlert = (() => {
    if (props.feature === "outcome" && bucketMap["failed"] > 0) {
      return <i className="codicon codicon-error text-error mr-1" />;
    }
    if (props.feature === "outcome" && (bucketMap["gave_up"] / props.dataset.length) > 0.33) {
      return <i className="codicon codicon-alert text-warning mr-1" />;
    }
  })();

  const color = (i: number, bucket: string) => {
    switch (bucket) {
      case "passed":
        return THEME_COLORS.success;
      case "failed":
        return THEME_COLORS.error;
      case "gave_up":
        return THEME_COLORS.warning;
    }
    const colors = [
      THEME_COLORS.primary,
      THEME_COLORS.accent,
    ];
    return colors[i % colors.length];
  };

  return <div className="BucketChart">
    {heuristicAlert}
    Categorized by <code>{props.feature}</code>
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
