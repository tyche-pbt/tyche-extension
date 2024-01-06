import { ExampleFilter, SampleInfo } from "./report";
import Card from "./ui/Card";
import { PrettyExample } from "./ui/PrettyExample";

type ExampleViewProps = {
  dataset: SampleInfo[];
  filter?: ExampleFilter;
  closeExamples: () => void;
};

export const ExampleView = (props: ExampleViewProps) => {
  const { filter } = props;

  let dataset: SampleInfo[];
  let filterText: string;

  if (filter === undefined) {
    dataset = props.dataset;
    filterText = "";
  } else if ("ordinal" in filter) {
    dataset = props.dataset.filter((x) =>
      x.features.ordinal[filter.ordinal] === filter.value);
    filterText = `${filter.ordinal} = ${filter.value}`;
  } else if ("nominal" in filter) {
    dataset = props.dataset.filter((x) =>
      x.features.nominal[filter.nominal] === filter.value);
    filterText = `${filter.nominal} = ${filter.value}`;
  } else {
    dataset = filter.examples;
    filterText = filter.subset;
  }

  return <>
    <div className="fixed top-0 right-0 left-0 bg-accent py-2 px-3 h-10 flex justify-between items-center z-40">
      <button onClick={props.closeExamples}>
        <i className="codicon codicon-close text-background" />
      </button>
      <span className="text-sm text-background font-mono">
        {filterText}
      </span>
    </div>
    <div className="w-full">
      <Card>
        <div className="font-bold text-lg">Samples</div>
        <span className="font-mono">
          {filterText}
        </span>
      </Card>
      {dataset.map((x, i) =>
        <Card key={`example-${i}`} className="mt-2">
          <PrettyExample example={x} />
        </Card>
      )}
    </div>
  </>;
};
