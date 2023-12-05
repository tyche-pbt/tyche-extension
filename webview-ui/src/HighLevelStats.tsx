import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SampleInfo } from "../../src/datatypes";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";

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

  return <div className="HighLevelStats">
    <div>
      <table>
        <tr>
          <td>Property</td>
          <td>{props.property}</td>
        </tr>
        <tr>
          <td>Total Samples</td>
          <td>{props.dataset.length}</td>
        </tr>
      </table>
    </div>
    <VSCodeDivider />
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
  </div>;
}
