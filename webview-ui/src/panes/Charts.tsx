import { ExampleFilter, SampleInfo } from "../../../src/datatypes";
import { FeatureChart } from "../visualization/FeatureChart";
import { BucketChart } from "../visualization/BucketChart";
import Card from "../ui/Card";
import { UniqueTimeChart } from "../visualization/UniqueTimeChart";

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

  return <div className="w-full grid grid-cols-1">
    <Card>
      <UniqueTimeChart
        dataset={dataset}
      />
    </Card>
    {[...features.categorical.map((x) =>
      <Card key={`bucket-${x}`}>
        <BucketChart
          feature={x}
          dataset={dataset}
          viewValue={(value) => props.setFilteredView({ categorical: x, value })} />
      </Card>
    ),
    ...features.numerical.flatMap((x) =>
      [
        <Card key={`feature-${x}`}>
          <FeatureChart
            feature={x}
            dataset={dataset}
            viewValue={(value) => props.setFilteredView({ numerical: x, value })} />
        </Card>,
      ]),
    ]}
  </div >;
}