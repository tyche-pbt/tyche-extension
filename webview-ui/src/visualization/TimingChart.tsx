import { useState } from "react";
import { VisualizationSpec, SignalListeners } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";
import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import Card from "../ui/Card";

type TimingChartProps = {
  dataset: SampleInfo[];
  viewValues: (samples: SampleInfo[]) => void;
};

export const TimingChart = ({ dataset, viewValues }: TimingChartProps) => {
  const [cumulative, setCumulative] = useState(false);
  const handleSetCumulative = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCumulative(e.target.checked);
  };

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
    <Card>
      <Distribution
        title={<span className="font-bold">Timing Breakdown</span>}
        spec={cumulativeSpec}
        listeners={listeners}
      />
      <label className="flex items-center my-4 text-lg">
        <input type="checkbox" className="w-4 h-4" onChange={handleSetCumulative} />
        <span className="ml-2 leading-none">Cumulative</span>
      </label>
      <button
        className={
          "w-full py-1 text-center rounded-md " +
          (brush == null
            ? "cursor-not-allowed"
            : "cursor-pointer hover:bg-primary hover:bg-opacity-25")
        }
        onClick={() => viewValues(dataset.slice(brush?.[0] ?? 0, brush?.[1] ?? dataset.length))}
        disabled={brush == null}
        title={brush == null ? "Use shift + drag to select a range of samples" : undefined}>
        View selected samples <i className="ml-1 codicon codicon-arrow-right" />
      </button>
    </Card>
  );
};
