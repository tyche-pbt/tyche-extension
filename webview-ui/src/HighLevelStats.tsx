import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SampleInfo } from "../../src/datatypes";
import { Drawer } from "./Drawer";

type HighLevelStatsProps = {
  property: string;
  dataset: SampleInfo[];
};

export const HighLevelStats = (props: HighLevelStatsProps) => {
  const unique = new Set(props.dataset.map((x) => x.item.toString())).size;

  const data = [{
    name: "unique",
    unique,
    duplicates: props.dataset.length - unique,
  }];

  const heuristicAlert = (() => {
    if (unique / props.dataset.length < 0.66) {
      return <span className="tooltip">
        <i className="codicon codicon-alert icon-yellow tooltip" style={{ marginRight: "4px" }}></i>
        <div className="tooltip-text">
          This property has a high ratio of duplicate samples.
        </div>
      </span>
    }
  })();

  return <div className="HighLevelStats">
    {heuristicAlert} Categorized by <code>unique</code>
    <Drawer open>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          width={800}
          height={100}
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, props.dataset.length]} />
          <YAxis type="category" dataKey="name" hide={true} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="unique"
            stackId="a"
            fill="#D08770"
          />
          <Bar
            dataKey="duplicates"
            stackId="a"
            fill="#A3BE8C"
          />
        </BarChart>
      </ResponsiveContainer>
    </Drawer>
  </div>;
}
