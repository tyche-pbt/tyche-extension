import { SampleInfo } from "../../../src/datatypes";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, Vega } from "react-vega";
import { Handler } from "vega-tooltip";
import * as vl from "vega-lite";

type FeatureChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: number) => void;
};

export const FeatureChart = (props: FeatureChartProps) => {
  const { feature, viewValue } = props;

  const dataset = props.dataset;

  const featureData: { label: number; freq: number; }[] =
    Array.from(dataset.filter(x => x.features.numerical[feature] !== undefined).map((x) => Math.round(x.features.numerical[feature]))
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .map(([k, v]) => ({ label: k, freq: v }));

  const liteSpec: vl.TopLevelSpec = {
    width: "container",
    height: 150,
    mark: "bar",
    encoding: {
      x: { field: "label", type: "ordinal", bin: true, axis: { title: null } },
      y: { field: "freq", type: "quantitative", axis: { title: "# of Samples" } },
      color: { value: THEME_COLORS.primary }
    },
    data: { name: "table", values: featureData }
  };

  const spec = vl.compile(liteSpec).spec;
  spec.signals = [...spec.signals || [], {
    name: "filter",
    value: {},
    on: [
      { events: "rect:mousedown", update: "datum" },
    ]
  }];

  const listeners: SignalListeners = {
    filter: (_name, value) => {
      viewValue((value as { label: number }).label)
    }
  };

  return <div className="w-full">
    <div>
      <span className="font-bold">Distribution of</span> <span className="text-sm font-mono">{feature}</span>
    </div>
    <Vega
      renderer="svg"
      signalListeners={listeners}
      spec={spec}
      tooltip={new Handler().call} />
  </div>;
}
