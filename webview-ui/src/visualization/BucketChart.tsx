import { SampleInfo } from "../../../src/datatypes";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, Vega } from "react-vega";
import { Handler } from "vega-tooltip";
import * as vl from "vega-lite";
import { Popover } from "@headlessui/react";

type BucketChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: string) => void;
};

export const BucketChart = (props: BucketChartProps) => {
  const buckets = Array.from(new Set(props.dataset.flatMap((x) => {
    if (!(props.feature in x.features.categorical)) {
      return [];
    }
    return [x.features.categorical[props.feature]];
  })));

  const bucketedData: { label: string, freq: number }[] = buckets.map(
    (bucket) => ({
      label: bucket,
      freq: props.dataset.filter((y) => y.features.categorical[props.feature] === bucket).length / props.dataset.length,
    }));

  const liteSpec: vl.TopLevelSpec = {
    width: "container",
    height: 20,
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
    data: { name: "table", values: bucketedData },
    layer: [{
      mark: { type: "bar", cursor: "pointer" },
      params: [{
        name: "highlight",
        select: { type: "point", on: "mouseover", clear: "mouseout" },
      }],
      encoding: {
        x: {
          aggregate: "sum",
          field: "freq",
          stack: "normalize",
          title: "% of Samples",
        },
        fillOpacity: {
          condition: { param: "highlight", empty: false, value: 0.7 },
          value: 1
        },
        color: {
          field: "label",
          title: "Category",
          scale: {
            range: [
              THEME_COLORS.primary,
              THEME_COLORS.success,
              THEME_COLORS.warning,
              THEME_COLORS.error,
              THEME_COLORS.accent,
            ],
          },
        }
      },
    }, {
      mark: { type: "text", color: "white", font: "Tahoma, sans-serif" },
      encoding: {
        x: {
          aggregate: "sum",
          field: "freq",
          stack: "normalize",
          bandPosition: 0.5,
        },
        text: {
          field: "label",
        },
      }
    },
    ]
  };

  const spec = vl.compile(liteSpec).spec;
  spec.signals = [...spec.signals || [], {
    name: "filter",
    value: {},
    on: [
      { events: "rect:mousedown", update: "datum" },
      { events: "text:mousedown", update: "datum" },
    ]
  }];

  const listeners: SignalListeners = {
    filter: (_name, value) => {
      props.viewValue((value as { label: string }).label)
    }
  };

  return <div className="w-full">
    <div className="flex mb-1">
      <div>
        <span className="font-bold">Distribution of</span> <span className="font-mono">{props.feature}</span>
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
