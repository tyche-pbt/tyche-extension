import { ExampleFilter, SampleInfo } from "../../../src/datatypes";
import { FeatureChart } from "../visualization/FeatureChart";
import { BucketChart } from "../visualization/BucketChart";
import Card from "../ui/Card";
import { UniqueTimeChart } from "../visualization/UniqueTimeChart";

type ChartsProps = {
  dataset: SampleInfo[];
  features: {
    ordinal: string[];
    nominal: string[];
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
    {[...features.nominal.map((x) =>
      <Card key={`bucket-${x}`}>
        <BucketChart
          feature={x}
          dataset={dataset}
          viewValue={(value) => props.setFilteredView({ nominal: x, value })} />
      </Card>
    ),
    ...features.ordinal.flatMap((x) =>
      [
        <Card key={`feature-${x}`}>
          <FeatureChart
            feature={x}
            dataset={dataset}
            viewValue={(value) => props.setFilteredView({ ordinal: x, value })} />
        </Card>,
      ]),
    ]}
  </div >;
}