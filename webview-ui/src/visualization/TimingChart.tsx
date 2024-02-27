import { SampleInfo } from "../report";
import { THEME_COLORS } from "../utilities/colors";
import { VisualizationSpec } from "react-vega";
import Distribution, { vegaConfig } from "./Distribution";
import { useState } from "react";

type TimingChartProps = {
  dataset: SampleInfo[];
};

export const TimingChart = ({ dataset }: TimingChartProps) => {
  const [cumulative, setCumulative] = useState(false);
  const handleSetCumulative = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCumulative(e.target.checked);
  };

  if (dataset.length === 0) {
    return <div className="text-center">No samples</div>;
  }

  dataset.sort((a, b) => {
    if ("timing" in a.dataLine) {
      if ("timing" in b.dataLine) {
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
      "timing" in x.dataLine
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
          on: "[pointerdown[event.shiftKey], pointerup] > pointermove",
        },
      },
      {
        name: "grid",
        select: {
          type: "interval",
          on: "[pointerdown[!event.shiftKey], pointerup] > pointermove[!event.shiftKey]",
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

  // const totalTimeData = dataset.map((x) => ({
  //   totalTime:
  //     "timing" in x.dataLine ? Object.entries(x.dataLine.timing).reduce((a, [, b]) => a + b, 0) : 0,
  // }));

  // Samples binned by total time
  // const binnedSpec: VisualizationSpec = {
  //   $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  //   config: vegaConfig,
  //   width: "container",
  //   data: { name: "table", values: totalTimeData },
  //   mark: { type: "bar", tooltip: true },
  //   encoding: {
  //     x: {
  //       bin: {
  //         maxbins: 20,
  //       },
  //       field: "totalTime",
  //       type: "quantitative",
  //     },
  //     y: {
  //       aggregate: "count",
  //       scale: {
  //         zero: true,
  //       },
  //     },
  //   },
  // };

  return (
    <>
      <label className="flex items-center my-4 text-lg">
        <input type="checkbox" className="w-6 h-6" onChange={handleSetCumulative} />
        <span className="ml-2 leading-none">Cumulative</span>
      </label>
      <Distribution
        title={<span className="font-bold">Timing Breakdown</span>}
        spec={cumulativeSpec}
        listeners={{}}
      />
    </>
  );
};
