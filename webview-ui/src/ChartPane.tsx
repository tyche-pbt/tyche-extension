import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { FeatureChart } from "./FeatureChart";
import { BucketChart } from "./BucketChart";
import { HighLevelStats } from "./HighLevelStats";
import { FailureInfo } from "./FailureInfo";
import Markdown from "react-markdown";
import { Drawer } from "./Drawer";
import { Divider } from "./Divider";

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

  return <div className="ChartPane w-full">
    <h3>{property} ({dataset.length} samples)</h3>
    {
      info.map((x, i) =>
        <div key={`info-${i}`}>
          <Divider />
          <div className="my-2 mx-0">
            <i className="codicon codicon-info mr-1"></i> {x.title}
            <Drawer>
              <Markdown>{x.content}</Markdown>
            </Drawer>
          </div>
        </div>
      )
    }
    <Divider />
    <HighLevelStats dataset={dataset} property={property} />
    {dataset.some(x => x.outcome === "failed") &&
      <>
        <Divider />
        <FailureInfo dataset={dataset} />
      </>
    }
    {pageElements.flatMap((x, i) => [<Divider key={`divider-${i}`} />, x])}
  </div>;
}