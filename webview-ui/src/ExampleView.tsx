import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import Card from "./ui/Card";
import { PrettyExample } from "./ui/PrettyExample";

type ExampleViewProps = {
  dataset: SampleInfo[];
  filter?: ExampleFilter;
};

export const ExampleView = (props: ExampleViewProps) => {
  const { filter } = props;

  const dataset = filter
    ? props.dataset.filter((x) =>
      ("numerical" in filter && x.features.numerical[filter.numerical] === filter.value) ||
      ("categorical" in filter && x.features.categorical[filter.categorical] === filter.value)
    )
    : props.dataset;

  return <div className="w-full">
    <Card>
      <div className="font-bold text-lg">Samples</div>
      {filter &&
        <span className="font-mono">{"numerical" in filter ? filter.numerical : filter.categorical} = {filter.value}</span>}
    </Card>
    {dataset.map((x, i) =>
      <Card key={`example-${i}`} className="mt-2">
        <PrettyExample example={x} />
      </Card>
    )}
  </div>;
};
