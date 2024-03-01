import {
  ExampleFilter,
  SampleInfo,
  TestInfo,
  isDuplicate,
  isFailed,
  isInvalid,
  isPassed,
  isUnique,
} from "../report";
import Card from "../ui/Card";
import Tooltip from "../ui/Tooltip";
import { MosaicChart } from "../visualization/MosaicChart";

type HighLevelStatsProps = {
  property: string;
  testInfo: TestInfo;
  setExampleFilter: (filter: ExampleFilter) => void;
};

type BreakdownProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
};

const Breakdown = (props: BreakdownProps) => {
  const { samples, setExampleFilter } = props;

  const validity: [string, (x: SampleInfo) => boolean][] = [
    ["Failed", isFailed],
    ["Passed", isPassed],
    ["Invalid", isInvalid],
  ];

  const uniqueness: [string, (x: SampleInfo) => boolean][] = [
    ["Unique", isUnique],
    ["Duplicate", isDuplicate],
  ];

  return (
    <>
      <div className="flex justify-between ml-20 mr-10">
        {uniqueness.map(([uniquenessKey, uniquenessPred]) => {
          const width = (samples.filter(uniquenessPred).length / samples.length) * 100;
          if (!width) return null;
          return (
            <span key={uniquenessKey + "-label"} className="text-sm font-bold">
              {uniquenessKey}
            </span>
          );
        })}
      </div>
      <div className="flex">
        <div className="w-24">
          {validity.map(([validityKey, validityPred]) => {
            const height = (samples.filter(validityPred).length / samples.length) * 100;
            if (!height) return null;
            return (
              <div
                key={validityKey + "-label"}
                className="flex items-center text-sm font-bold"
                style={{ height: height + "%" }}>
                {validityKey}
              </div>
            );
          })}
        </div>
        <div className="w-full h-48">
          {validity.map(([validityKey, validityPred], i) =>
            uniqueness.map(([uniquenessKey, uniquenessPred]) => {
              const colors = ["error", "success", "warning"];
              const slice = samples.filter(validityPred).filter(uniquenessPred);
              const width = (slice.length / samples.filter(validityPred).length) * 100;
              const height = (samples.filter(validityPred).length / samples.length) * 100;
              const bg = `bg-${colors[i]} ${uniquenessKey === "Duplicate" ? "bg-opacity-60 " : ""}`;
              const textDec =
                validityKey === "Passed" && uniquenessKey === "Unique" ? "font-bold" : "";
              if (!width || !height) return null;
              return (
                <div
                  key={validityKey + "-" + uniquenessKey + "-cell"}
                  style={{ width: width - 0.1 + "%", height: height + "%" }}
                  className="float-left text-sm p-0.5"
                  onClick={() =>
                    setExampleFilter({
                      subset: validityKey + ", " + uniquenessKey,
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
          {validity.map(([validityKey, validityPred]) => {
            const slice = samples.filter(validityPred);
            const height = (slice.length / samples.length) * 100;
            if (!height) return null;
            return (
              <div
                key={validityKey + "-label"}
                className="flex items-center px-1 text-sm italic text-right rounded-md cursor-pointer hover:bg-primary hover:bg-opacity-25"
                style={{ height: height + "%" }}
                onClick={() =>
                  setExampleFilter({
                    subset: validityKey,
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
        {uniqueness.map(([uniquenessKey, uniquenessPred]) => {
          const slice = samples.filter(uniquenessPred);
          const width = (slice.length / samples.length) * 100;
          if (!width) return null;
          return (
            <span
              key={uniquenessKey + "-label"}
              className="px-2 text-sm italic rounded-md cursor-pointer hover:bg-primary hover:bg-opacity-25"
              onClick={() =>
                setExampleFilter({
                  subset: uniquenessKey,
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

export const HighLevelStats = (props: HighLevelStatsProps) => {
  const samples = props.testInfo.samples;
  const invalids = props.testInfo.samples.filter(isInvalid);
  const validDuplicates = props.testInfo.samples.filter((x) => isDuplicate(x) && !isInvalid(x));

  const invalidPercent = Math.round((invalids.length / samples.length) * 100);
  const duplicatePercent = Math.round((validDuplicates.length / samples.length) * 100);
  const uniqueValid = props.testInfo.samples.filter(
    (x) => (isPassed(x) || isFailed(x)) && isUnique(x)
  );

  return (
    <div className="grid w-full grid-cols-2">
      <Card className="col-span-1">
        <div className="text-sm opacity-60">Tested</div>
        <span className="text-3xl">{uniqueValid.length}</span> unique cases.
      </Card>
      <Card className="col-span-1">
        <div className="text-sm opacity-60">Generated</div>
        <span className="text-3xl">{samples.length}</span> samples.
      </Card>
      {invalidPercent > 33 && (
        <Card className="col-span-2">
          <div className="flex">
            <div className="flex-1 text-sm opacity-60">Discarded</div>
            <div
              className="px-2 text-sm font-bold text-white rounded-full bg-warning"
              title="This property has a high proportion of discarded samples. Consider writing a generator that enforces preconditions by construction.">
              {">33%"}
            </div>
          </div>
          <span className="text-3xl">{invalids.length}</span> invalid samples.
        </Card>
      )}
      {duplicatePercent > 33 && (
        <Card className="col-span-2">
          <div className="flex">
            <div className="flex-1 text-sm opacity-60">Revisited</div>
            <div
              className="px-2 text-sm font-bold text-white rounded-full bg-warning"
              title="This property has a high proportion of duplicate samples. Consider generating in a larger space.">
              {">33%"}
            </div>
          </div>
          <span className="text-3xl">{validDuplicates.length}</span> valid duplicates.
        </Card>
      )}
      <Card className="col-span-2">
        <div className="flex-1">
          <span className="mb-1 overflow-hidden font-bold text-nowrap overflow-ellipsis">
            Sample Breakdown
          </span>{" "}
          <Tooltip>
            Click on a region of the chart to see the samples that contribute to it.
            <br />
            Uniqueness is computed based on the string representation of each sample.
          </Tooltip>
        </div>
        <Breakdown samples={props.testInfo.samples} setExampleFilter={props.setExampleFilter} />
        <MosaicChart
          samples={props.testInfo.samples}
          setExampleFilter={props.setExampleFilter}
          verticalAxis={[
            ["Failed", isFailed],
            ["Passed", isPassed],
            ["Invalid", isInvalid],
          ]}
          horizontalAxis={[
            ["Unique", isUnique],
            ["Duplicate", isDuplicate],
          ]}
          colors={["error", "success", "warning"]}
        />
      </Card>
    </div>
  );
};
