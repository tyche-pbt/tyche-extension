import { ExampleFilter, SampleInfo } from "../../../src/datatypes";
import { FeatureChart } from "../visualization/FeatureChart";
import { BucketChart } from "../visualization/BucketChart";
import Card from "../ui/Card";

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

  return <div className="w-full flex">
    <Card className="flex-1 min-w-0">
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
    </Card>
  </div>;
}