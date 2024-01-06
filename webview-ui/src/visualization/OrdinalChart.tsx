import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type OrdinalChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: number) => void;
};

export const OrdinalChart = (props: OrdinalChartProps) => {
  const { feature, viewValue } = props;

  const dataset = props.dataset.filter(x => x.outcome !== "gave_up");
  if (dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  const featureData: { label: number; freq: number; }[] =
    Array.from(dataset.filter(x => x.features.ordinal[feature] !== undefined).map((x) => x.features.ordinal[feature])
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .map(([k, v]) => ({ label: k, freq: v }));

  const quality = featureData.every(x => parseInt(x.label.toString()) === x.label) ? "ordinal" : "quantitative";

  const spec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: featureData },
    width: "container",
    height: 150,
    signals: [{
      name: "filter",
      value: {},
      on: [{ events: "rect:mousedown", update: "datum" }]
    }],
    params: [{
      name: "highlight",
      select: { type: "point", on: "mouseover", clear: "mouseout" },
    }],
    mark: { type: "bar", cursor: "pointer" },
    encoding: {
      x: { field: "label", type: quality, bin: true, axis: { title: null } },
      y: { field: "freq", type: "quantitative", axis: { title: "# of Samples" } },
      color: { value: THEME_COLORS.primary },
      fillOpacity: {
        condition: { param: "highlight", empty: false, value: 0.7 },
        value: 1
      }
    },
  };

  const listeners: SignalListeners = {
    filter: (_name, value) => {
      viewValue((value as { label: number }).label)
    }
  };

  return <Distribution
    title={<>
      <span className="font-bold">Distribution of</span> <span className="font-mono">{feature}</span>
    </>}
    spec={spec}
    listeners={listeners}
  />;
}
