import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, TestInfo } from "../../src/datatypes";
import { PrettyExample } from "./PrettyExample";
import { useState } from "react";
import { MainView } from "./MainView";
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

  if (testInfo.type && testInfo.type === "failure") {
    return <div className="App">
      The property failed with the following counterexample:
      <PrettyExample example={testInfo.counterExample} />
      and the following error:
      <pre>{testInfo.message}</pre>
    </div>;
  }

  if (testInfo.type && testInfo.type === "error") {
    return <div className="App">
      Something went wrong. The test runner failed with the following error:
      <pre>{testInfo.message}</pre>
    </div>;
  }

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
        <MainView
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