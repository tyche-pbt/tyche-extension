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
    (("ordinal" in filter && x.features.ordinal[filter.ordinal] === filter.value) ||
      ("nominal" in filter && x.features.nominal[filter.nominal] === filter.value))
    )
    : props.dataset;

  return <div className="w-full">
    <Card>
      <div className="font-bold text-lg">Samples</div>
      {filter &&
        <span className="font-mono">{"ordinal" in filter ? filter.ordinal : filter.nominal} = {filter.value}</span>}
    </Card>
    {dataset.map((x, i) =>
      <Card key={`example-${i}`} className="mt-2">
        <PrettyExample example={x} />
      </Card>
    )}
  </div>;
};
