import { SampleInfo } from "../../../src/datatypes";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, Vega } from "react-vega";
import { Handler } from "vega-tooltip";
import * as vl from "vega-lite";
import { Popover } from "@headlessui/react";

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
    mark: { type: "bar", cursor: "pointer" },
    config: {
      axis: {
        labelFont: "Tahoma, sans-serif",
        titleFont: "Tahoma, sans-serif",
      },
      legend: {
        labelFont: "Tahoma, sans-serif",
        titleFont: "Tahoma, sans-serif",
      }
    },
    params: [{
      name: "highlight",
      select: { type: "point", on: "mouseover", clear: "mouseout" },
    }],
    encoding: {
      x: { field: "label", type: "ordinal", bin: true, axis: { title: null } },
      y: { field: "freq", type: "quantitative", axis: { title: "# of Samples" } },
      color: { value: THEME_COLORS.primary },
      fillOpacity: {
        condition: { param: "highlight", empty: false, value: 0.7 },
        value: 1
      }
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
    <div className="flex mb-1">
      <div>
        <span className="font-bold">Distribution of</span> <span className="font-mono">{feature}</span>
      </div>
      <div className="flex-auto flex flex-row-reverse">
        <Popover className="relative">
          <Popover.Button className="mr-2">
            <i className="codicon codicon-menu" />
          </Popover.Button>
          <Popover.Panel className="absolute w-44 right-2 top-8 z-10 bg-white border border-black border-opacity-25 rounded-md">
            {({ close }) =>
              <>
                <button className="w-full hover:bg-primary hover:bg-opacity-25 text-left px-2 py-1"
                  onClick={() => {
                    const exportSpec = liteSpec;
                    exportSpec["$schema"] = "https://vega.github.io/schema/vega-lite/v5.json";
                    navigator.clipboard.writeText(JSON.stringify(exportSpec, null, 2));
                    close();
                  }}>
                  Copy Vega-Lite Spec
                </button>
                <button className="w-full hover:bg-primary hover:bg-opacity-25 text-left px-2 py-1"
                  onClick={() => {
                    window.open("https://vega.github.io/editor/#/custom/vega-lite");
                    close();
                  }}>
                  Open Vega Editor
                </button>
              </>
            }
          </Popover.Panel>
        </Popover>
      </div>
    </div>
    <Vega
      className="w-full"
      renderer="svg"
      signalListeners={listeners}
      spec={spec}
      tooltip={new Handler().call}
      actions={false}
    />
  </div>;
}
