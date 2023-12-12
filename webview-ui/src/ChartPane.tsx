import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { BucketChart } from "./BucketChart";
import { HighLevelStats } from "./HighLevelStats";
import { FailureInfo } from "./FailureInfo";
import Markdown from "react-markdown";
import { Drawer } from "./Drawer";

type ChartPaneProps = {
  property: string;
  dataset: SampleInfo[];
  info: { type: string, title: string, content: string }[];
  features: string[];
  bucketings: string[];
  setFilteredView: (exampleFilter: ExampleFilter) => void;
}

export const ChartPane = (props: ChartPaneProps) => {
  const { dataset, features, bucketings, property, info } = props;

  const pageElements =
    [...bucketings.map((x) =>
      <BucketChart
        key={`bucket-${x}`}
        bucketing={x}
        dataset={dataset}
        viewValue={(value) => props.setFilteredView({ bucketing: x, value })} />),
    ...features.flatMap((x) =>
      [
        <FeatureChart
          key={`feature-${x}`}
          feature={x}
          dataset={dataset}
          viewValue={(value) => props.setFilteredView({ feature: x, value })}
        />,
      ]),
    ]

  return <div className="ChartPane">
    <h3>{property} ({dataset.length} samples)</h3>
    {
      info.map((x, i) =>
        <div key={`info-${i}`}>
          <VSCodeDivider />
          <div style={{ margin: "10px 0" }}>
            <i className="codicon codicon-info icon-blue"></i> {x.title}
            <Drawer>
              <Markdown>{x.content}</Markdown>
            </Drawer>
          </div>
        </div>
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
    {pageElements.flatMap((x, i) => [<VSCodeDivider key={`divider-${i}`} />, x])}
  </div>;
}