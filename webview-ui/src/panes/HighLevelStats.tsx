import {
  ExampleFilter,
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
  simplifiedMode?: boolean;
  setExampleFilter: (filter: ExampleFilter) => void;
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

  if (props.simplifiedMode) {
    return <div className="grid w-full grid-cols-2">
      <Card className="col-span-1">
        <div className="text-sm opacity-60">Tested</div>
        <span className="text-3xl">{uniqueValid.length}</span> unique cases.
      </Card>
      <Card className="col-span-1">
        <div className="text-sm opacity-60">Generated</div>
        <span className="text-3xl">{samples.length}</span> samples.
      </Card>
    </div>;
  }

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
          additionalLabelClasses={(verticalCategory, horizontalCategory) =>
            verticalCategory === "Passed" && horizontalCategory === "Unique" ? "font-bold" : ""
          }
        />
      </Card>
    </div>
  );
};
