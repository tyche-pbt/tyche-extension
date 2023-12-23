import { TestInfo } from "../../../src/datatypes";
import Card from "../ui/Card";

type HighLevelStatsProps = {
  property: string;
  testInfo: TestInfo;
};

export const HighLevelStats = (props: HighLevelStatsProps) => {
  return <div className="flex w-full">
    <Card className="flex-1">
      <div className="flex flex-row-reverse">
        <div className="text-xs text-background rounded-lg font-bold bg-warning px-1">
          {Math.round(props.testInfo.discards / props.testInfo.samples.length * 100)}%
        </div>
      </div>
      <span className="text-3xl">
        {props.testInfo.discards}
      </span> discards
    </Card>
    <Card className="flex-1">
      <div className="flex flex-row-reverse">
        <div className="text-xs text-background rounded-lg bg-success font-bold px-1">
          {Math.round(props.testInfo.duplicates / props.testInfo.samples.length * 100)}%
        </div>
      </div>
      <span className="text-3xl">
        {props.testInfo.duplicates}
      </span> duplicates
    </Card>
  </div>;
};
