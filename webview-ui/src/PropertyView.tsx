import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { useState } from "react";
import { ChartPane } from "./ChartPane";
import { ExampleView } from "./ExampleView";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

type PageState =
  { state: "main" }
  | { state: "examples" }
  | { state: "filtered", exampleFilter: ExampleFilter };

const PropertyView = (props: PropertyViewProps) => {
  const [pageView, setPageView] = useState<PageState>({ state: "main" });

  const { testInfo, property } = props;

  const features = testInfo.samples.map(sample => Object.keys(sample.features)).reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const bucketings = testInfo.samples.map(sample => Object.keys(sample.bucketings)).reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

  return (
    <div className="PropertyView">
      <div className="top-buttons">
        <VSCodeButton
          style={{ marginRight: "10px" }}
          onClick={() => pageView.state === "main" ? setPageView({ state: "examples" }) : setPageView({ state: "main" })}
        >
          {pageView.state === "main" ? <i className="codicon codicon-list-ordered" /> : <i className="codicon codicon-graph" />}
        </VSCodeButton>
      </div>

      {pageView.state === "main" &&
        <ChartPane
          setFilteredView={(f) => setPageView({ state: "filtered", exampleFilter: f })}
          coverage={testInfo.coverage}
          dataset={testInfo.samples}
          info={testInfo.info}
          features={features}
          bucketings={bucketings}
          property={property}
        />}
      {pageView.state === "examples" && <ExampleView dataset={testInfo.samples} />}
      {pageView.state === "filtered" && <ExampleView dataset={testInfo.samples} filter={pageView.exampleFilter} />}
    </div>
  );
};

export default PropertyView;