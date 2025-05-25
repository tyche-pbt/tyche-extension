import { useState } from "react";
import { VisualizationSpec, SignalListeners } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";
import { SampleInfo } from "../report";

type TimingChartProps = {
  dataset: SampleInfo[];
  viewValues: (samples: SampleInfo[]) => void;
};

export const TimingChart = ({ dataset, viewValues }: TimingChartProps) => {
  const [cumulative, setCumulative] = useState(false);

  const [brush, setBrush] = useState<[number, number] | null>(null);

  if (
    dataset.length === 0 ||
    dataset.every((x) => !("timing" in x.dataLine && x.dataLine.timing))
  ) {
    return null;
  }

  dataset.sort((a, b) => {
    if ("timing" in a.dataLine && a.dataLine.timing) {
      if ("timing" in b.dataLine && b.dataLine.timing) {
        return (
          Object.values(a.dataLine.timing).reduce((acc, v) => acc + v, 0) -
          Object.values(b.dataLine.timing).reduce((acc, v) => acc + v, 0)
        );
      } else {
        return 1;
      }
    } else {
      if ("timing" in b.dataLine) {
        return -1;
      } else {
        return 0;
      }
    }
  });
  const cumulativeData: { step: number; event: string; time: number }[] = dataset.flatMap(
    (x, step) =>
      "timing" in x.dataLine && x.dataLine.timing
        ? Object.entries(x.dataLine.timing).map(([event, time]) => ({ step, event, time }))
        : []
  );

  const cumulativeSpec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    config: vegaConfig,
    data: { name: "table", values: cumulativeData },
    mark: { type: "area", tooltip: true },
    width: "container",
    height: 100,
    params: [
      {
        name: "brush",
        select: {
          type: "interval",
          on: "[mousedown[event.shiftKey], mouseup] > mousemove!",
          translate: "[mousedown[event.shiftKey], mouseup] > mousemove!",
          zoom: "wheel![event.shiftKey]",
        },
      },
      {
        name: "pan_zoom",
        select: {
          type: "interval",
          on: "[mousedown[!event.shiftKey], mouseup] > mousemove",
          translate: "[mousedown[!event.shiftKey], mouseup] > mousemove!",
          zoom: "wheel![!event.shiftKey]",
        },
        bind: "scales",
      },
    ],
    transform: [
      {
        sort: [{ field: "step", order: "ascending" }],
        window: [
          {
            op: "sum",
            field: "time",
            as: "cumulative_time",
          },
        ],
        groupby: ["event"],
      },
    ],
    encoding: {
      x: { field: "step", type: "quantitative", axis: { title: null } },
      y: cumulative
        ? {
          aggregate: "sum",
          field: "cumulative_time",
          title: "Cumulative time",
        }
        : {
          aggregate: "sum",
          field: "time",
          title: "Time",
        },
      color: {
        field: "event",
        title: "Event",
      },
    },
  };

  const listeners: SignalListeners = {
    brush: (name, value) => {
      setBrush((value as { step?: [number, number] }).step ?? null);
    },
  };

  return (
    <>
      <Distribution
        title={<span className="font-bold">Timing Breakdown</span>}
        spec={cumulativeSpec}
        listeners={listeners}
        tooltip="This charts shows the time spent in each phase of the testing process, for each input. Use Shift + Drag to select a range of samples."
      />
      <div className="flex justify-around mb-1">
        <button onClick={() => setCumulative(!cumulative)}
          className="rounded-md border-accent border px-4 hover:bg-accent hover:bg-opacity-25 text-sm">
          {cumulative ? "Show Time per Sample" : "Show Cumulative Time"}
        </button>
        <button
          className={
            "px-4 rounded-md border border-accent2 text-sm " +
            (brush == null
              ? " cursor-not-allowed text-foreground text-opacity-50 border-opacity-25"
              : " cursor-pointer hover:bg-accent2 hover:bg-opacity-25")
          }
          onClick={() => viewValues(dataset.slice(brush?.[0] ?? 0, brush?.[1] ?? dataset.length))}
          disabled={brush == null}>
          View Selected Samples <i className="ml-1 codicon codicon-arrow-right" />
        </button>
      </div>
    </>
  );
};
