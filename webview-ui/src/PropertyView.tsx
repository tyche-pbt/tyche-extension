import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { useState } from "react";
import { ChartPane } from "./ChartPane";
import { ExampleView } from "./ExampleView";

type PropertyViewProps = {
  testInfo: TestInfo;
};

type PageState =
  { state: "main" }
  | { state: "examples" }
  | { state: "filtered", exampleFilter: ExampleFilter };

const PropertyView = (props: PropertyViewProps) => {
  const [pageView, setPageView] = useState<PageState>({ state: "main" });

  const { testInfo } = props;

  const features = Object.keys(testInfo.samples[0].features);
  const bucketings = Object.keys(testInfo.samples[0].bucketings);

  return (
    <div className="PropertyView">
      <div className="top-buttons">
        <VSCodeButton
          style={{ marginRight: "10px" }}
          onClick={() => pageView.state === "main" ? setPageView({ state: "examples" }) : setPageView({ state: "main" })}
        >
          {pageView.state === "main" ? "See More Examples" : "Back to Overview"}
        </VSCodeButton>
      </div>

      {pageView.state === "main" &&
        <ChartPane
          setFilteredView={(f) => setPageView({ state: "filtered", exampleFilter: f })}
          coverage={testInfo.coverage}
          dataset={testInfo.samples}
          features={features}
          bucketings={bucketings}
        />}
      {pageView.state === "examples" && <ExampleView dataset={testInfo.samples} />}
      {pageView.state === "filtered" && <ExampleView dataset={testInfo.samples} filter={pageView.exampleFilter} />}
    </div>
  );
};

export default PropertyView;