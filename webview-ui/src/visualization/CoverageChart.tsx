import { SampleInfo } from "../report";
import { VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";
import { uniqueTokens } from "observability-tools";

type CoverageChartProps = {
  dataset: SampleInfo[];
};

export const CoverageChart = (props: CoverageChartProps) => {
  if (props.dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  let covered: Set<string> = new Set();
  let coveredInteractions: Set<string> = new Set();

  const rawData: { step: number, lines_covered: number, interactions_covered: number }[] = [];
  props.dataset.forEach((x, i) => {
    Object.entries(x.coverage).forEach(([prop, lines]) => lines.forEach((line) => covered.add(`${prop}:${line}`)));
    uniqueTokens("arguments" in x.dataLine ? x.dataLine.arguments : null).forEach((x: any) => coveredInteractions.add(x));
    rawData.push({ step: i, lines_covered: covered.size, interactions_covered: coveredInteractions.size });
  });

  // Normalize and massage
  const data: { step: number, value: number, type: "Lines Covered" | "Interactions Covered" }[] = [];
  rawData.forEach((x) => {
    data.push({ step: x.step, value: (x.lines_covered / covered.size) * 100, type: "Lines Covered" });
    data.push({ step: x.step, value: (x.interactions_covered / coveredInteractions.size) * 100, type: "Interactions Covered" });
  })

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
        field: "value",
        type: "quantitative",
        axis: { title: "% of Coverage" }
      },
      color: {
        field: "type"
      },
    }
  };

  return <Distribution
    title={<span className="font-bold">Unique Lines Covered Over Run</span>}
    spec={spec}
    listeners={{}}
  />;
}

