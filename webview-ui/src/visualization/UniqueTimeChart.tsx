import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type UniqueTimeChartProps = {
  dataset: SampleInfo[];
};

export const UniqueTimeChart = (props: UniqueTimeChartProps) => {
  let s = 0;

  const data: { step: number, total: number }[] = [];
  props.dataset.forEach((x, i) => {
    if (!x.duplicate && x.outcome !== "gave_up") {
      s += 1;
    }
    data.push({ step: i, total: s });
  });

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
        axis: { title: "# of Samples" }
      },
      color: { value: THEME_COLORS.primary },
    },
  };

  return <Distribution
    title={<span className="font-bold">Unique, Valid Samples Over Run</span>}
    spec={spec}
    listeners={{}}
  />;
}
