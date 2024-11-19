import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type TwoDChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: number) => void;
};

export const TwoDChart = (props: TwoDChartProps) => {
  const { feature, viewValue } = props;

  const dataset = props.dataset.filter(x => x.outcome !== "gave_up");
  if (dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  const data = dataset.filter(x => x.features.twoD[feature] !== undefined);
  const xlabel = data[0].features.twoD[feature][0][0];
  const ylabel = data[0].features.twoD[feature][1][0];
  const featureData: { x: number, y: number }[] =
    Array.from(data.map((v) => {
      const [x, y] = v.features.twoD[feature];
      return { x: x[1], y: y[1] };
    }));

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
    mark: { type: "point", cursor: "pointer", tooltip: true },
    encoding: {
      x: { field: "x", type: "quantitative", axis: { title: xlabel } },
      y: { field: "y", type: "quantitative", axis: { title: ylabel } },
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
