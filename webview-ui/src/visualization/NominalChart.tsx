import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { SignalListeners, VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";

type NominalChartProps = {
  feature: string;
  dataset: SampleInfo[];
  viewValue: (v: string | undefined) => void;
};

export const NominalChart = (props: NominalChartProps) => {
  const dataset = props.dataset.filter(x => x.outcome !== "gave_up");
  if (dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  const buckets = Array.from(new Set(dataset.map((x) =>
    x.features.nominal[props.feature]
  )));

  const data: { label: string, freq: number }[] = buckets.map(
    (bucket) => ({
      rawLabel: bucket,
      label: bucket === undefined ? "N/a" : bucket === "" ? "true" : bucket,
      freq: dataset.filter((y) => y.features.nominal[props.feature] === bucket).length / props.dataset.length,
    }));

  const binsSpec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: data },
    width: "container",
    height: 40,
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
    data: { name: "table", values: data },
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
      const label = (value as { label: string }).label;
      if (label === "N/a") {
        props.viewValue(undefined);
      } else {
        props.viewValue(label);
      }
    }
  };

  return <Distribution
    title={<>
      <span className="font-bold">Distribution of</span> <span className="font-mono">{props.feature}</span>
    </>}
    spec={spec}
    listeners={listeners}
    tooltip="Click on a region of the chart below to see the samples that contribute to it."
  />;
}
