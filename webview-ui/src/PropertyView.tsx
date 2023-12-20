import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { useState } from "react";
import { ChartPane } from "./ChartPane";
import { ExampleView } from "./ExampleView";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

type PageState = ExampleFilter | undefined;

const PropertyView = (props: PropertyViewProps) => {
  const [state, setState] = useState<PageState>(undefined);

  const { testInfo, property } = props;

  const features = testInfo.samples.map(sample => Object.keys(sample.features)).reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const bucketings = testInfo.samples.map(sample => Object.keys(sample.bucketings)).reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

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
          state &&
          <VSCodePanelTab id="filtered-examples">
            Filtered: &nbsp;<code>{"feature" in state ? state.feature : state.bucketing} = {state.value}</code>
            <i
              className="codicon codicon-close ml-2"
              onClick={() => setState(undefined)}
            />
          </VSCodePanelTab>
        }

        <VSCodePanelView id="main" className="w-full">
          <ChartPane
            setFilteredView={(f) => setState(f)}
            dataset={testInfo.samples}
            info={testInfo.info}
            features={features}
            bucketings={bucketings}
            property={property}
          />
        </VSCodePanelView>
        <VSCodePanelView id="examples" className="w-full">
          <ExampleView dataset={testInfo.samples} />
        </VSCodePanelView>
        {
          <VSCodePanelView id="filtered-examples">
            <ExampleView dataset={testInfo.samples} filter={state} />
          </VSCodePanelView>
        }
      </VSCodePanels>
    </div>
  );
};

export default PropertyView;