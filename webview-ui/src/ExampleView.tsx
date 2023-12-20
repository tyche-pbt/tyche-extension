import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { PrettyExample } from "./PrettyExample";
import { Divider } from "./Divider";

type ExampleViewProps = {
  dataset: SampleInfo[];
  filter?: ExampleFilter;
};

export const ExampleView = (props: ExampleViewProps) => {
  const { filter } = props;

  const dataset = filter
    ? props.dataset.filter((x) =>
      ("feature" in filter && x.features[filter.feature] === filter.value) ||
      ("bucketing" in filter && x.bucketings[filter.bucketing] === filter.value)
    )
    : props.dataset;

  return <div className="ExampleView w-full h-lvh overflow-scroll">
    {filter
      ? <>Examples where <code>{"feature" in filter ? filter.feature : filter.bucketing} = {filter.value}</code></>
      : <>All Examples</>
    } ({dataset.length})
    {dataset.map((x, i) => [<Divider key={`divider-${i}`} />, <PrettyExample key={`example-${i}`} example={x} />]).slice(1)}
  </div>;
};
