import { ExampleFilter, TestInfo } from "./report";
import { Charts } from "./panes/Charts";
import { HighLevelStats } from "./panes/HighLevelStats";
import { FailingCases } from "./panes/FailingCases";
import Status from "./panes/Status";
import Card from "./ui/Card";
import { useState } from "react";
import { ExampleView } from "./ExampleView";
import { SimpleExampleView } from "./SimpleExampleView";
import Info from "./panes/Info";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
  setShouldShowExplainer: (shouldShowExplainer: boolean) => void;
  simplifiedMode: boolean;
  goBack: () => void;
};

const PropertyView = (props: PropertyViewProps) => {
  const { testInfo, property, simplifiedMode } = props;
  const [exampleFilter, setExampleFilterRaw] = useState<ExampleFilter | "all" | undefined>(undefined);

  if (simplifiedMode) {
    return <SimpleExampleView testInfo={testInfo} closeExamples={props.goBack} property={property} />;
  }

  const setExampleFilter = (filter: ExampleFilter | "all" | undefined) => {
    setExampleFilterRaw(filter);
    props.setShouldShowExplainer(filter === undefined);
  }

  const ordinal = testInfo.samples
    .map(sample => Object.keys(sample.features.ordinal))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const nominal = testInfo.samples
    .map(sample => Object.keys(sample.features.nominal))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const continuous = testInfo.samples
    .map(sample => Object.keys(sample.features.continuous))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const twoD = testInfo.samples
    .map(sample => Object.keys(sample.features.twoD))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

  return <>
    {exampleFilter !== undefined &&
      <ExampleView filter={exampleFilter === "all" ? undefined : exampleFilter} dataset={testInfo.samples} closeExamples={() => setExampleFilter(undefined)} />
    }
    {exampleFilter === undefined &&
      <>
        <Status status={testInfo.status} />
        {testInfo.status === "failure" &&
          <FailingCases dataset={testInfo.samples} />}
        <HighLevelStats testInfo={testInfo} property={property}
          setExampleFilter={setExampleFilter} />
        <Card>
          <button
            className="text-center rounded-md w-full hover:bg-primary hover:bg-opacity-25 py-1"
            onClick={() => setExampleFilter("all")} >
            See All Samples <i className="codicon codicon-arrow-right ml-1" />
          </button>
        </Card>
        <Charts
          setFilteredView={setExampleFilter}
          dataset={testInfo.samples}
          features={{ ordinal, nominal, continuous, twoD }}
        />
        <Info info={testInfo.info} />
      </>
    }
  </>;
};

export default PropertyView;