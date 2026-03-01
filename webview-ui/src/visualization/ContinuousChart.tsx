import { useState } from "react";
import { Popover } from "@headlessui/react";
import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type ContinuousChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: number) => void;
};

export const ContinuousChart = (props: ContinuousChartProps) => {
  const { feature, viewValue } = props;

  const [xDomain, setXDomain] = useState<[number, number] | null>(null);
  const [inputMin, setInputMin] = useState("");
  const [inputMax, setInputMax] = useState("");

  const dataset = props.dataset.filter(x => x.outcome !== "gave_up");
  if (dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  const featureData: { label: number; value: number; }[] =
    Array.from(dataset.filter(x => x.features.continuous[feature] !== undefined).map((x) => x.features.continuous[feature])
      .reduce((acc, curr) => {
        return (acc.get(curr) ? acc.set(curr, acc.get(curr)! + 1) : acc.set(curr, 1), acc);
      }, new Map<number, number>()))
      .map(([k, v]) => ({ label: k, value: v }));

  const spec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: featureData },
    width: "container",
    height: 80,
    signals: [{
      name: "filter",
      value: {},
      on: [{ events: "rect:mousedown", update: "datum" }]
    }],
    params: [{
      name: "highlight",
      select: { type: "point", on: "mouseover", clear: "mouseout" },
    }],
    mark: { type: "circle", cursor: "pointer", tooltip: true },
    encoding: {
      x: {
        field: "label",
        type: "quantitative",
        axis: { title: null },
        ...(xDomain ? { scale: { domain: xDomain } } : {}),
      },
      size: { field: "value", type: "ordinal", legend: null },
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

  const configureControls = (
    <Popover className="relative">
      <Popover.Button className={`mx-2 text-xs px-1 py-0.5 border rounded ${xDomain ? "border-primary text-primary" : "border-current"}`}>
        Axes{xDomain ? "*" : ""}
      </Popover.Button>
      <Popover.Panel className="absolute w-52 right-0 top-8 z-10 bg-white border border-black border-opacity-25 rounded-md p-2">
        {({ close }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <label className="text-xs w-8">Min</label>
              <input
                type="number"
                className="flex-1 border border-black border-opacity-25 rounded px-1 py-0.5 text-xs"
                value={inputMin}
                onChange={e => setInputMin(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-xs w-8">Max</label>
              <input
                type="number"
                className="flex-1 border border-black border-opacity-25 rounded px-1 py-0.5 text-xs"
                value={inputMax}
                onChange={e => setInputMax(e.target.value)}
              />
            </div>
            <div className="flex gap-1 mt-1">
              <button
                className="flex-1 text-xs px-1 py-0.5 bg-primary text-white rounded"
                onClick={() => {
                  const min = parseFloat(inputMin);
                  const max = parseFloat(inputMax);
                  if (!isNaN(min) && !isNaN(max)) {
                    setXDomain([min, max]);
                    close();
                  }
                }}
              >
                Apply
              </button>
              <button
                className="flex-1 text-xs px-1 py-0.5 border border-black border-opacity-25 rounded"
                onClick={() => {
                  setXDomain(null);
                  setInputMin("");
                  setInputMax("");
                  close();
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </Popover.Panel>
    </Popover>
  );

  return <Distribution
    title={<>
      <span className="font-bold">Distribution of</span> <span className="font-mono">{feature}</span>
    </>}
    spec={spec}
    listeners={listeners}
    controls={configureControls}
  />;
}
