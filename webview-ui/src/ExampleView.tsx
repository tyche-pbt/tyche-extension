import { ExampleFilter, SampleInfo } from "../../src/datatypes";
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

  return <div className="ExampleView w-full">
    {filter
      ? <>Examples where <code>{"numerical" in filter ? filter.numerical : filter.categorical} = {filter.value}</code></>
      : <>All Examples</>
    } ({dataset.length})
    {dataset.map((x, i) => <PrettyExample key={`example-${i}`} example={x} />)}
  </div>;
};
