import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { CoverageItem, ExampleFilter, SampleInfo } from "../../src/datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { BucketChart } from "./BucketChart";
import { HighLevelStats } from "./HighLevelStats";
import { CoverageInfo } from "./CoverageInfo";

type ChartPaneProps = {
  dataset: SampleInfo[];
  coverage: { [key: string]: CoverageItem };
  features: string[];
  bucketings: string[];
  setFilteredView: (exampleFilter: ExampleFilter) => void;
}

export const ChartPane = (props: ChartPaneProps) => {
  const { dataset, features, bucketings } = props;

  const pageElements =
    [...bucketings.map((x) =>
      <BucketChart bucketing={x} dataset={dataset} viewValue={(value) => props.setFilteredView({ bucketing: x, value })} />),
    ...features.flatMap((x) =>
      [
        <FeatureChart
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
        />,
      ]),
    ]

  return <div className="ChartPane">
    <HighLevelStats dataset={dataset} />
    <VSCodeDivider />
    <CoverageInfo coverage={props.coverage}></CoverageInfo>
    {pageElements.flatMap(x => [<VSCodeDivider />, x])}
  </div>;
}