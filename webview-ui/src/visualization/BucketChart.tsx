import { SampleInfo } from "../../../src/datatypes";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, Vega } from "react-vega";
import { Handler } from "vega-tooltip";
import * as vl from "vega-lite";

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
      mark: { type: "text", color: "white" },
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
    <div>
      <span className="font-bold">Distribution of</span> <span className="text-sm font-mono">{props.feature}</span>
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
