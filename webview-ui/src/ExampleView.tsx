import { ExampleFilter, SampleInfo } from "./report";
import { StaticCard } from "./ui/Card";
import { PrettyExample } from "./ui/PrettyExample";
import { Transition } from "@headlessui/react";
import { useState, useMemo, memo } from "react";
import { useDebounce } from "./utilities/useDebounce";

type ExampleViewProps = {
  dataset: SampleInfo[];
  filter?: ExampleFilter;
  closeExamples: () => void;
};

export const ExampleView = ({ dataset, filter, closeExamples }: ExampleViewProps) => {
  const [textSearchFilter, setTextSearchFilter] = useState("");
  const debouncedTextSearchFilter = useDebounce(textSearchFilter, 300);
  const onTextFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextSearchFilter(() => e.target.value);
  };

  // We need to memoize this for referential equality to prevent the sample list from rerendeing
  // when this component's state updates
  const [processedSamples, filterText] = useMemo(() => {
    // Apply example filter
    let exampleFiltered: SampleInfo[];
    let filterText: string;
    if (filter === undefined) {
      exampleFiltered = dataset;
      filterText = "";
    } else if ("ordinal" in filter) {
      exampleFiltered = dataset.filter((x) => x.features.ordinal[filter.ordinal] === filter.value);
      filterText = `${filter.ordinal} = ${filter.value}`;
    } else if ("nominal" in filter) {
      exampleFiltered = dataset.filter((x) => x.features.nominal[filter.nominal] === filter.value);
      filterText = `${filter.nominal} = ${filter.value}`;
    } else {
      exampleFiltered = filter.examples;
      filterText = filter.subset;
    }

    // Apply text filter
    const textFiltered = exampleFiltered.filter((x) =>
      x.item.toLocaleLowerCase().includes(debouncedTextSearchFilter.toLocaleLowerCase())
    );

    // Deduplicate & count
    const deduped: { [key: string]: [SampleInfo, number] } = {};
    textFiltered.forEach((x) => {
      if (x.item in deduped) {
        deduped[x.item][1] += 1;
      } else {
        deduped[x.item] = [x, 1];
      }
    });

    // Apply sort
    const sortedSamples = Object.entries(deduped).sort(([, [, a]], [, [, b]]) => b - a);

    return [sortedSamples, filterText];
  }, [dataset, filter, debouncedTextSearchFilter]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-10 px-3 py-2 bg-accent">
        <button onClick={closeExamples}>
          <i className="codicon codicon-close text-background" />
        </button>
        <div>
          <input
            type="text"
            className="px-2 py-1 mr-4 focus:outline-none"
            value={textSearchFilter}
            placeholder="Filter..."
            onChange={onTextFilterChange}
          />
          <span className="font-mono text-sm text-background">{filterText}</span>
        </div>
      </div>
      <Transition
        appear={true}
        show={true}
        enter="transition-all duration-300"
        enterFrom="opacity-0 -translate-x-8"
        enterTo="opacity-100"
        as="div">
        <SampleList
          samples={processedSamples}
          filterText={filterText}
          highlightText={debouncedTextSearchFilter}
        />
      </Transition>
    </>
  );
};

type SampleListProps = {
  filterText: string;
  highlightText: string;
  samples: [string, [SampleInfo, number]][];
};

// This component is memoized to prevent the list from rerendering unnecessarily when the
// ExampleView updates, such as when typing in the text filter box
const SampleList = memo(({ filterText, samples, highlightText }: SampleListProps) => (
  <div className="w-full">
    <StaticCard>
      <div className="text-lg font-bold">Samples</div>
      <span className="font-mono">{filterText}</span>
    </StaticCard>
    {samples.map(([key, [x, count]], i) => (
      <StaticCard key={key} className="mt-2">
        <PrettyExample example={x} highlightText={highlightText} duplicateCount={count} />
      </StaticCard>
    ))}
  </div>
));
