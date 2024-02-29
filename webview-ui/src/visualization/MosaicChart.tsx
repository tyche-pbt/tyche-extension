import { ExampleFilter, SampleInfo, TestInfo } from "../report";

type MosaicChartProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
  axis1: [string, (x: SampleInfo) => boolean][];
  axis2: [string, (x: SampleInfo) => boolean][];
};

export const MosaicChart = (props: MosaicChartProps) => {
  const { samples, setExampleFilter, axis1, axis2 } = props;

  const horizontalAxis = axis1;
  const verticalAxis = axis2;

  return (
    <>
      <div className="flex justify-between ml-20 mr-10">
        {verticalAxis.map(([verticalKey, verticalPred]) => {
          const width = (samples.filter(verticalPred).length / samples.length) * 100;
          if (!width) return null;
          return (
            <span key={verticalKey + "-label"} className="text-sm font-bold">
              {verticalKey}
            </span>
          );
        })}
      </div>
      <div className="flex">
        <div className="w-24">
          {horizontalAxis.map(([horizontalKey, horizontalPred]) => {
            const height = (samples.filter(horizontalPred).length / samples.length) * 100;
            if (!height) return null;
            return (
              <div
                key={horizontalKey + "-label"}
                className="flex items-center text-sm font-bold"
                style={{ height: height + "%" }}>
                {horizontalKey}
              </div>
            );
          })}
        </div>
        <div className="w-full h-48">
          {horizontalAxis.map(([horizontalKey, horizontalPred], i) =>
            verticalAxis.map(([verticalKey, verticalPred]) => {
              const colors = ["error", "success", "warning"];
              const slice = samples.filter(horizontalPred).filter(verticalPred);
              const width = (slice.length / samples.filter(horizontalPred).length) * 100;
              const height = (samples.filter(horizontalPred).length / samples.length) * 100;
              const bg = `bg-${colors[i]} ${verticalKey === "Duplicate" ? "bg-opacity-60 " : ""}`;
              const textDec =
                horizontalKey === "Passed" && verticalKey === "Unique" ? "font-bold" : "";
              if (!width || !height) return null;
              return (
                <div
                  key={horizontalKey + "-" + verticalKey + "-cell"}
                  style={{ width: width - 0.1 + "%", height: height + "%" }}
                  className="float-left text-sm p-0.5"
                  onClick={() =>
                    setExampleFilter({
                      subset: horizontalKey + ", " + verticalKey,
                      examples: slice,
                    })
                  }>
                  <div
                    className={
                      "w-full h-full hover:bg-opacity-70 cursor-pointer flex items-center justify-center " +
                      bg +
                      textDec
                    }>
                    {slice.length}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="w-10">
          {horizontalAxis.map(([horizontalKey, horizontalPred]) => {
            const slice = samples.filter(horizontalPred);
            const height = (slice.length / samples.length) * 100;
            if (!height) return null;
            return (
              <div
                key={horizontalKey + "-label"}
                className="flex items-center px-1 text-sm italic text-right rounded-md cursor-pointer hover:bg-primary hover:bg-opacity-25"
                style={{ height: height + "%" }}
                onClick={() =>
                  setExampleFilter({
                    subset: horizontalKey,
                    examples: slice,
                  })
                }>
                {slice.length}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between ml-20 mr-10">
        {verticalAxis.map(([verticalKey, verticalPred]) => {
          const slice = samples.filter(verticalPred);
          const width = (slice.length / samples.length) * 100;
          if (!width) return null;
          return (
            <span
              key={verticalKey + "-label"}
              className="px-2 text-sm italic rounded-md cursor-pointer hover:bg-primary hover:bg-opacity-25"
              onClick={() =>
                setExampleFilter({
                  subset: verticalKey,
                  examples: slice,
                })
              }>
              {slice.length}
            </span>
          );
        })}
      </div>
    </>
  );
};
