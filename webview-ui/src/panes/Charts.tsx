import { ExampleFilter, SampleInfo } from "../report";
import { OrdinalChart } from "../visualization/OrdinalChart";
import { NominalChart } from "../visualization/NominalChart";
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
    {[...features.nominal.map((x) =>
      <Card key={`bucket-${x}`}>
        <NominalChart
          feature={x}
          dataset={dataset}
          viewValue={(value) => props.setFilteredView({ nominal: x, value })} />
      </Card>
    ),
    ...features.ordinal.flatMap((x) =>
      [
        <Card key={`feature-${x}`}>
          <OrdinalChart
            feature={x}
            dataset={dataset}
            viewValue={(value) => props.setFilteredView({ ordinal: x, value })} />
        </Card>,
      ]),
    ]}
    <Card>
      <UniqueTimeChart
        dataset={dataset}
      />
    </Card>
  </div >;
}