import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type CoverageChartProps = {
  dataset: SampleInfo[];
};

export const CoverageChart = (props: CoverageChartProps) => {
  if (props.dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  let covered: Set<string> = new Set();

  const data: { step: number, total: number }[] = [];
  props.dataset.forEach((x, i) => {
    Object.entries(x.coverage).forEach(([prop, lines]) => lines.forEach((line) => covered.add(`${prop}:${line}`)));
    data.push({ step: i, total: covered.size });
  });

  if (covered.size === 0) {
    return null;
  }

  const spec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: data },
    width: "container",
    height: 100,
    mark: { type: "line", cursor: "pointer" },
    encoding: {
      x: {
        field: "step",
        type: "quantitative",
        axis: { title: null }
      },
      y: {
        field: "total",
        type: "quantitative",
        axis: { title: "# of Lines" }
      },
      color: { value: THEME_COLORS.primary },
    },
  };

  return <Distribution
    title={<span className="font-bold">Unique Lines Covered Over Run</span>}
    spec={spec}
    listeners={{}}
  />;
}
