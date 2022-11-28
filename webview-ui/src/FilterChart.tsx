import {
  Tooltip,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { SampleInfo } from "./datatypes";

type FilterChartProps = {
  filter: string;
  dataset: SampleInfo[];
};

export const FilterChart = (props: FilterChartProps) => {
  const filtered = props.dataset.filter((x) => x.filters[props.filter]);
  const countFiltered = filtered.length;
  const filteredData = [
    { name: props.filter, value: countFiltered },
    { name: "not " + props.filter, value: props.dataset.length - countFiltered },
  ];

  return <div className="FilterChart">
    <div className="chart-title">
      Proportion <code>{props.filter}</code>
    </div>
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie dataKey="value" data={filteredData} cx="40%" outerRadius={60}>
          <Cell key="cell-0" fill="#A3BE8C" />
          <Cell key="cell-1" fill="#D08770" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>;
}
