import Markdown from "react-markdown";
import { TestInfo } from "./report";
import Card from "./ui/Card";
import { PrettyExample } from "./ui/PrettyExample";

type SimpleExampleViewProps = {
  property: string;
  testInfo: TestInfo;
  closeExamples: () => void;
};

export const SimpleExampleView = ({ property, testInfo, closeExamples }: SimpleExampleViewProps) => {
  const dataset = testInfo.samples;
  return <>
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-10 px-3 py-2 bg-accent">
      <button onClick={closeExamples}>
        <i className="codicon codicon-close text-background" />
      </button>
    </div>
    <Card className="mb-2">
      <div className="text-lg font-bold">Examples</div>
      <div className="text-sm">
        This page shows the results of executing <span className="text-accent break-all">{property}</span>,
        including Hypothesis's "Show Statistics" output and a list of
        the examples generated during testing.
      </div>
    </Card>
    <Card className="mb-2">
      {testInfo.info.map((x) =>
        <Markdown className="markdown text-sm break-words py-1">{x.content}</Markdown>
      )}
    </Card>
    <Card>
      <div className="w-full">
        {dataset.filter((x) => x.item !== "").map((x, key) => (
          <div key={key}>
            <div className="my-4">
              <PrettyExample example={x} noExpand />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </Card>
  </>;
};