import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { CoverageItem, ExampleFilter, SampleInfo } from "../../src/datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { BucketChart } from "./BucketChart";
import { HighLevelStats } from "./HighLevelStats";
import { CoverageInfo } from "./CoverageInfo";
import { FailureInfo } from "./FailureInfo";
import Markdown from "react-markdown";
import { Drawer } from "./Drawer";

type ChartPaneProps = {
  property: string;
  dataset: SampleInfo[];
  coverage: { [key: string]: CoverageItem };
  info: { type: string, title: string, content: string }[];
  features: string[];
  bucketings: string[];
  setFilteredView: (exampleFilter: ExampleFilter) => void;
}

export const ChartPane = (props: ChartPaneProps) => {
  const { dataset, features, bucketings, property, info } = props;

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
    <h3>{property} ({dataset.length} samples)</h3>
    {
      info.map((x) =>
        <>
          <VSCodeDivider />
          <div>
            <i className="codicon codicon-info"></i> {x.title}
            <Drawer>
              <Markdown>{x.content}</Markdown>
            </Drawer>
          </div>
        </>
      )
    }
    <VSCodeDivider />
    <HighLevelStats dataset={dataset} property={property} />
    {dataset.some(x => x.outcome === "failed") &&
      <>
        <VSCodeDivider />
        <FailureInfo dataset={dataset} />
      </>
    }
    {Object.entries(props.coverage).length > 0
      ?
      <>
        <VSCodeDivider />
        <CoverageInfo coverage={props.coverage}></CoverageInfo>
      </>
      : <></>}
    {pageElements.flatMap(x => [<VSCodeDivider />, x])}
  </div>;
}