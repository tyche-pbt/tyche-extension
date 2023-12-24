import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { Charts } from "./panes/Charts";
import { HighLevelStats } from "./panes/HighLevelStats";
import { FailingCases } from "./panes/FailingCases";
import Info from "./panes/Info";
import Card from "./ui/Card";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { ExampleView } from "./ExampleView";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

const PropertyView = (props: PropertyViewProps) => {
  const { testInfo, property } = props;
  const [exampleFilter, setExampleFilter] = useState<ExampleFilter | undefined>(undefined);

  const numerical = testInfo.samples
    .map(sample => Object.keys(sample.features.numerical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const categorical = testInfo.samples
    .map(sample => Object.keys(sample.features.categorical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

  return <>
    <Dialog open={exampleFilter !== undefined} onClose={() => setExampleFilter(undefined)}>
      <Dialog.Panel className="fixed top-0 left-0 right-0 bottom-0 bg-background p-3 overflow-scroll">
        <button onClick={() => setExampleFilter(undefined)}>Close</button>
        <ExampleView filter={exampleFilter} dataset={testInfo.samples} />
      </Dialog.Panel>
    </Dialog>
    <Card>
      <div className="text-lg font-bold">
        Tyche Output
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
    <Charts
      setFilteredView={setExampleFilter}
      dataset={testInfo.samples}
      features={{ numerical, categorical }}
    />
  </>;
};

export default PropertyView;