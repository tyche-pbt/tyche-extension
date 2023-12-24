import { TestInfo } from "../../../src/datatypes";
import Card from "../ui/Card";

type HighLevelStatsProps = {
  property: string;
  testInfo: TestInfo;
};

export const HighLevelStats = (props: HighLevelStatsProps) => {
  const samples = props.testInfo.samples.length;
  const discards = props.testInfo.samples.filter((x) => x.outcome === "gave_up").length;
  const duplicates = props.testInfo.samples.filter((x) => x.duplicate).length;
  const discardPercent = Math.round(discards / samples * 100);
  const duplicatePercent = Math.round(duplicates / samples * 100);

  return <div className="grid grid-cols-2 w-full">
    <Card className="col-span-1">
      <div className="opacity-60 text-xs">Tested</div>
      <span className="text-3xl">
        {props.testInfo.samples.filter((x) => x.outcome === "passed" && !x.duplicate).length}
      </span> unique cases.
    </Card>
    <Card className="col-span-1">
      <div className="opacity-60 text-xs">Generated</div>
      <span className="text-3xl">
        {props.testInfo.samples.length}
      </span> samples.
    </Card>
    <Card className="col-span-1">
      <div className="flex">
        <div className="opacity-60 text-xs flex-1">Discarded</div>
        {
          discardPercent > 33 &&
          <div className="text-xs text-white rounded-full font-bold px-2 bg-warning">
            High
          </div>
        }
      </div>
      <span className="text-3xl">
        {discards}
      </span> invalid tests.
    </Card>
    <Card className="col-span-1">
      <div className="flex">
        <div className="opacity-60 text-xs flex-1">Revisited</div>
        {
          duplicatePercent > 33 &&
          <div className="text-xs text-white rounded-full font-bold px-2 bg-warning">
            High
          </div>
        }
      </div>
      <span className="text-3xl">
        {duplicates}
      </span> duplicates.
    </Card>
  </div>;
};
