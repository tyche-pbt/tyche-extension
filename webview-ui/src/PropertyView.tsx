import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { Charts } from "./panes/Charts";
import { HighLevelStats } from "./panes/HighLevelStats";
import { FailingCases } from "./panes/FailingCases";
import Info from "./panes/Info";
import Card from "./ui/Card";
import { useState } from "react";
import { ExampleView } from "./ExampleView";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

const PropertyView = (props: PropertyViewProps) => {
  const { testInfo, property } = props;
  const [exampleFilter, setExampleFilter] = useState<ExampleFilter | "all" | undefined>(undefined);

  const numerical = testInfo.samples
    .map(sample => Object.keys(sample.features.numerical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const categorical = testInfo.samples
    .map(sample => Object.keys(sample.features.categorical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

  return <>
    {exampleFilter !== undefined &&
      <>
        <div className="fixed top-0 right-0 left-0 bg-accent py-2 px-3 h-10 flex justify-between items-center">
          <button onClick={() => setExampleFilter(undefined)}>
            <i className="codicon codicon-close text-background" />
          </button>
        </div>
        <ExampleView filter={exampleFilter === "all" ? undefined : exampleFilter} dataset={testInfo.samples} />
      </>
    }
    {exampleFilter === undefined &&
      <>
        <Card>
          <div className="text-lg font-bold">
            Tyche Analysis
          </div>
          <span className="font-mono text-sm">
            {property}
          </span>
        </Card>
        <Info status={testInfo.status === "failure" ? "failure" : "success"} info={testInfo.info} />
        {testInfo.status === "failure" &&
          <FailingCases dataset={testInfo.samples} />
        }
        <HighLevelStats testInfo={testInfo} property={property} />
        <Card>
          <button
            className="text-sm text-center rounded-lg w-full hover:bg-primary hover:bg-opacity-25 py-1"
            onClick={() => setExampleFilter("all")} >
            See All Examples
          </button>
        </Card>
        <Charts
          setFilteredView={setExampleFilter}
          dataset={testInfo.samples}
          features={{ numerical, categorical }}
        />
      </>
    }
  </>;
};

export default PropertyView;