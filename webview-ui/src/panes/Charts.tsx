import { ExampleFilter, SampleInfo } from "../../../src/datatypes";
import { FeatureChart } from "../visualization/FeatureChart";
import { BucketChart } from "../visualization/BucketChart";

type ChartsProps = {
  dataset: SampleInfo[];
  features: {
    numerical: string[];
    categorical: string[];
  };
  setFilteredView: (exampleFilter: ExampleFilter) => void;
}

export const Charts = (props: ChartsProps) => {
  const { dataset, features } = props;

  return <div className="ChartPane w-full">
    {[...features.categorical.map((x) =>
      <BucketChart
        key={`bucket-${x}`}
        feature={x}
        dataset={dataset}
        viewValue={(value) => props.setFilteredView({ categorical: x, value })} />),
    ...features.numerical.flatMap((x) =>
      [
        <FeatureChart
          key={`feature-${x}`}
          feature={x}
          dataset={dataset}
          viewValue={(value) => props.setFilteredView({ numerical: x, value })}
        />,
      ]),
    ]}
  </div>;
}