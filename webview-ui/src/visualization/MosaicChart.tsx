import { ExampleFilter, SampleInfo, TestInfo } from "../report";

type MosaicChartProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
  horizontalAxis: [string, (x: SampleInfo) => boolean][];
  verticalAxis: [string, (x: SampleInfo) => boolean][];
  colors: string[];
};

export const MosaicChart = (props: MosaicChartProps) => {
  const { samples, setExampleFilter, horizontalAxis, verticalAxis, colors } = props;

  const bgOpacityGrades = opacityGrades(horizontalAxis.length);
  console.log(bgOpacityGrades);

  return (
    <>
      <div className="flex justify-between ml-20 mr-10">
        {horizontalAxis.map(([horizontalKey, horizontalPred]) => {
          const width = (samples.filter(horizontalPred).length / samples.length) * 100;
          if (!width) return null;
          return (
            <span key={horizontalKey + "-label"} className="text-sm font-bold">
              {horizontalKey}
            </span>
          );
        })}
      </div>
      <div className="flex">
        <div className="w-24">
          {verticalAxis.map(([verticalKey, verticalPred]) => {
            const height = (samples.filter(verticalPred).length / samples.length) * 100;
            if (!height) return null;
            return (
              <div
                key={verticalKey + "-label"}
                className="flex items-center text-sm font-bold"
                style={{ height: height + "%" }}>
                {verticalKey}
              </div>
            );
          })}
        </div>
        <div className="w-full h-48">
          {verticalAxis.map(([verticalKey, verticalPred], iv) =>
            horizontalAxis.map(([horizontalKey, horizontalPred], ih) => {
              const slice = samples.filter(verticalPred).filter(horizontalPred);
              const width = (slice.length / samples.filter(verticalPred).length) * 100;
              const height = (samples.filter(verticalPred).length / samples.length) * 100;
              const bg = `bg-${colors[iv]}/${bgOpacityGrades[ih]} hover:bg-${colors[iv]}/75 hover:brightness-125 `;
              const textDec =
                verticalKey === "Passed" && horizontalKey === "Unique" ? "font-bold" : "";
              if (!width || !height) return null;
              return (
                <div
                  key={verticalKey + "-" + horizontalKey + "-cell"}
                  style={{
                    width: width - 0.1 + "%",
                    height: height + "%",
                  }}
                  className="float-left text-sm p-0.5"
                  onClick={() =>
                    setExampleFilter({
                      subset: verticalKey + ", " + horizontalKey,
                      examples: slice,
                    })
                  }>
                  <div
                    className={
                      "w-full h-full cursor-pointer flex items-center justify-center " +
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
          {verticalAxis.map(([verticalKey, verticalPred]) => {
            const slice = samples.filter(verticalPred);
            const height = (slice.length / samples.length) * 100;
            if (!height) return null;
            return (
              <div
                key={verticalKey + "-label"}
                className="flex items-center px-1 text-sm italic text-right rounded-md cursor-pointer hover:bg-primary hover:bg-opacity-25"
                style={{ height: height + "%" }}
                onClick={() =>
                  setExampleFilter({
                    subset: verticalKey,
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
        {horizontalAxis.map(([horizontalKey, horizontalPred]) => {
          const slice = samples.filter(horizontalPred);
          const width = (slice.length / samples.length) * 100;
          if (!width) return null;
          return (
            <span
              key={horizontalKey + "-label"}
              className="px-4 py-2 text-sm italic rounded-md cursor-pointer hover:bg-primary hover:bg-opacity-25"
              onClick={() =>
                setExampleFilter({
                  subset: horizontalKey,
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

function opacityGrades(n: number, min: number = 0.6) {
  return [
    1,
    ...Array.from({ length: n - 2 }).map((_, x) => 1 - ((1 - min) / (n - 1)) * (x + 1)),
    min,
  ].map((x) => Math.round(x * 20) * 5);
  // .map((x) => `bg-opacity-${Math.round(x * 20) * 5}`);
}
