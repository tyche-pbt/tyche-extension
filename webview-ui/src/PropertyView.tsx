import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { useState } from "react";
import { ChartPane } from "./ChartPane";
import { ExampleView } from "./ExampleView";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

type PageState = ExampleFilter[];

const PropertyView = (props: PropertyViewProps) => {
  const [pageView, setPageView] = useState<PageState>([]);

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
          pageView.map((f, i) =>
            <VSCodePanelTab id={`examples-${i}`} key={`examples-${i}`}>
              <code>{"feature" in f ? f.feature : f.bucketing} = {f.value}</code>
              <i
                className="codicon codicon-close ml-2"
                onClick={() => setPageView(pageView.filter((g) =>
                  JSON.stringify(f) !== JSON.stringify(g)
                ))}
              />
            </VSCodePanelTab>)
        }

        <VSCodePanelView id="main" className="w-full">
          <ChartPane
            setFilteredView={(f) => {
              if (pageView.find((g) => JSON.stringify(f) === JSON.stringify(g)) === undefined) {
                setPageView([...pageView, f]);
              }
            }}
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
          pageView.map((f, i) =>
            <VSCodePanelView id={`examples-${i}`} key={`examples-${i}`} >
              <ExampleView dataset={testInfo.samples} filter={f} />
            </VSCodePanelView>)
        }
      </VSCodePanels>
    </div>
  );
};

export default PropertyView;