import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { BucketChart } from "./BucketChart";
import { HighLevelStats } from "./HighLevelStats";
import { CoverageInfo } from "./CoverageInfo";

type MainViewProps = {
  dataset: SampleInfo[];
  coverage: { [key: string]: { percentage: number } };
  features: string[];
  bucketings: string[];
  setFilteredView: (exampleFilter: ExampleFilter) => void;
}


export const MainView = (props: MainViewProps) => {
  const { dataset, features, bucketings } = props;

  const pageElements =
    [...features.flatMap((x) =>
      [<FeatureChart
        feature={x}
        dataset={dataset}
        viewValue={(value) => props.setFilteredView({ feature: x, value })}
      />,
      <ExtremeExamples
        feature={x}
        dataset={dataset}
        end="min"
      />,
      <ExtremeExamples
        feature={x}
        dataset={dataset}
        end="max"
      />]),
    ...bucketings.map((x) =>
      <BucketChart bucketing={x} dataset={dataset} viewValue={(value) => props.setFilteredView({ bucketing: x, value })} />)
    ]

  return <div className="MainView">
    <HighLevelStats dataset={dataset} />
    <VSCodeDivider />
    <CoverageInfo coverage={props.coverage}></CoverageInfo>
    {pageElements.flatMap(x => [<VSCodeDivider />, x])}
  </div>;
}