import {
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels
} from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { useState } from "react";
import { ChartPane } from "./ChartPane";
import { ExampleView } from "./ExampleView";

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
      <VSCodePanels className="w-full">
        <VSCodePanelTab id="main">
          Charts
        </VSCodePanelTab>
        <VSCodePanelTab id="examples">
          All Examples
        </VSCodePanelTab>
        {
          filter &&
          <VSCodePanelTab id="filtered-examples">
            Filtered: &nbsp;<code>{"numerical" in filter ? filter.numerical : filter.categorical} = {filter.value}</code>
            <i
              className="codicon codicon-close ml-2"
              onClick={() => setFilter(undefined)}
            />
          </VSCodePanelTab>
        }

        <VSCodePanelView id="main" className="w-full">
          <ChartPane
            setFilteredView={(f) => setFilter(f)}
            dataset={testInfo.samples}
            info={testInfo.info}
            features={{ numerical, categorical }}
            property={property}
          />
        </VSCodePanelView>
        <VSCodePanelView id="examples" className="w-full">
          <ExampleView dataset={testInfo.samples} />
        </VSCodePanelView>
        {
          filter &&
          <VSCodePanelView id="filtered-examples">
            <ExampleView dataset={testInfo.samples} filter={filter} />
          </VSCodePanelView>
        }
      </VSCodePanels>
    </div>
  );
};

export default PropertyView;