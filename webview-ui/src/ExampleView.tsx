import { ExampleFilter, SampleInfo } from "./report";
import { StaticCard } from "./ui/Card";
import { PrettyExample } from "./ui/PrettyExample";
import { Transition } from "@headlessui/react";

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
    dataset = props.dataset.filter((x) => x.features.ordinal[filter.ordinal] === filter.value);
    filterText = `${filter.ordinal} = ${filter.value}`;
  } else if ("nominal" in filter) {
    dataset = props.dataset.filter((x) => x.features.nominal[filter.nominal] === filter.value);
    filterText = `${filter.nominal} = ${filter.value}`;
  } else {
    dataset = filter.examples;
    filterText = filter.subset;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-10 px-3 py-2 bg-accent">
        <button onClick={props.closeExamples}>
          <i className="codicon codicon-close text-background" />
        </button>
        <span className="font-mono text-sm text-background">{filterText}</span>
      </div>
      <Transition
        appear={true}
        show={true}
        enter="transition-all duration-300"
        enterFrom="opacity-0 -translate-x-8"
        enterTo="opacity-100"
        as="div">
        <div className="w-full">
          <StaticCard>
            <div className="text-lg font-bold">Samples</div>
            <span className="font-mono">{filterText}</span>
          </StaticCard>
          {dataset.map((x, i) => (
            <StaticCard key={`example-${i}`} className="mt-2">
              <PrettyExample example={x} />
            </StaticCard>
          ))}
        </div>
      </Transition>
    </>
  );
};
