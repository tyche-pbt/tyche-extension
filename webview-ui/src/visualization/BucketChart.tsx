import { SampleInfo } from "../../../src/datatypes";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type BucketChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: string) => void;
};

export const BucketChart = (props: BucketChartProps) => {
  const buckets = Array.from(new Set(props.dataset.flatMap((x) => {
    if (!(props.feature in x.features.categorical)) { return []; }
    return [x.features.categorical[props.feature]];
  })));

  const bucketedData: { label: string, freq: number }[] = buckets.map(
    (bucket) => ({
      label: bucket,
      freq: props.dataset.filter((y) => y.features.categorical[props.feature] === bucket).length / props.dataset.length,
    }));

  const binsSpec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: bucketedData },
    width: "container",
    height: 20,
    signals: [{
      name: "filter",
      value: {},
      on: [
        { events: "rect:mousedown", update: "datum" },
        { events: "text:mousedown", update: "datum" },
      ]
    }],
    layer: [{
      params: [{
        name: "highlight",
        select: { type: "point", on: "mouseover", clear: "mouseout" },
      }],
      mark: { type: "bar", cursor: "pointer" },
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
              THEME_COLORS.accent,
              THEME_COLORS.accent2,
              THEME_COLORS.accent3,
              THEME_COLORS.accent4,
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

  const histSpec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: bucketedData },
    width: "container",
    height: 150,
    signals: [{
      name: "filter",
      value: {},
      on: [
        { events: "rect:mousedown", update: "datum" },
        { events: "text:mousedown", update: "datum" },
      ]
    }],
    params: [{
      name: "highlight",
      select: { type: "point", on: "mouseover", clear: "mouseout" },
    }],
    mark: { type: "bar", cursor: "pointer" },
    encoding: {
      x: { field: "label", type: "nominal", axis: { title: null } },
      y: { field: "freq", type: "quantitative", axis: { title: "# of Samples" } },
      color: { value: THEME_COLORS.primary },
      fillOpacity: {
        condition: { param: "highlight", empty: false, value: 0.7 },
        value: 1
      }
    },
  };

  const spec = buckets.length <= 5 ? binsSpec : histSpec;

  const listeners: SignalListeners = {
    filter: (_name, value) => {
      props.viewValue((value as { label: string }).label)
    }
  };

  return <Distribution
    title={<>
      <span className="font-bold">Distribution of</span> <span className="font-mono">{props.feature}</span>
    </>}
    spec={spec}
    listeners={listeners}
  />;
}
