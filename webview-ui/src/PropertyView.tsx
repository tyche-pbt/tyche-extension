import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { useState } from "react";
import { ChartPane } from "./ChartPane";
import { ExampleView } from "./ExampleView";
import { Tab } from "@headlessui/react";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

const PropertyView = (props: PropertyViewProps) => {
  const [filter, setFilter] = useState<ExampleFilter | undefined>(undefined);

  const { testInfo, property } = props;

  const numerical = testInfo.samples
    .map(sample => Object.keys(sample.features.numerical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const categorical = testInfo.samples
    .map(sample => Object.keys(sample.features.categorical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

  return (
    <div className="PropertyView w-full">
      <Tab.Group>
        <Tab.List>

          <Tab className="px-2 py-1 mr-2 border rounded ui-selected:text-blue-500 ui-selected:border-blue-500 hover:bg-slate-300" >
            Charts
          </Tab>
          <Tab className="px-2 py-1 mr-2 border rounded ui-selected:text-blue-500 ui-selected:border-blue-500 hover:bg-slate-300" >
            All Examples
          </Tab>
          {
            filter &&
            <Tab className="px-2 py-1 mr-2 border rounded ui-selected:text-blue-500 ui-selected:border-blue-500 hover:bg-slate-300" >
              Filtered: &nbsp;<code>{"numerical" in filter ? filter.numerical : filter.categorical} = {filter.value}</code>
              <i
                className="codicon codicon-close ml-2"
                onClick={() => setFilter(undefined)}
              />
            </Tab>
          }
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel className="w-full">
            <ChartPane
              setFilteredView={(f) => setFilter(f)}
              dataset={testInfo.samples}
              info={testInfo.info}
              features={{ numerical, categorical }}
              property={property}
            />
          </Tab.Panel>
          <Tab.Panel>
            <ExampleView dataset={testInfo.samples} />
          </Tab.Panel>
          {
            filter &&
            <Tab.Panel>
              <ExampleView dataset={testInfo.samples} filter={filter} />
            </Tab.Panel>
          }
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default PropertyView;