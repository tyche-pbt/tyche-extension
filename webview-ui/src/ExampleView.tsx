import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { PrettyExample } from "./PrettyExample";
import { useState } from "react";
import { Divider } from "./Divider";

type ExampleViewProps = {
  dataset: SampleInfo[];
  filter?: ExampleFilter;
};

const PAGE_LEN = 10;

export const ExampleView = (props: ExampleViewProps) => {
  const [page, setPage] = useState(0);

  const { filter } = props;

  const dataset = filter
    ? props.dataset.filter((x) =>
      ("feature" in filter && x.features[filter.feature] === filter.value) ||
      ("bucketing" in filter && x.bucketings[filter.bucketing] === filter.value)
    )
    : props.dataset;

  return <div className="ExampleView w-full">
    {filter &&
      <>
        <em>Examples where <code>{"feature" in filter ? filter.feature : filter.bucketing} = {filter.value}</code></em>
        <Divider />
      </>}
    {dataset.slice(page, page + PAGE_LEN).flatMap((x, i) => [<Divider key={`divider-${i}`} />, <PrettyExample key={`example-${i}`} example={x} />]).slice(1)}
    <div className="fixed bottom-1 right-1">
      <VSCodeButton onClick={() => setPage(page < PAGE_LEN ? dataset.length - PAGE_LEN : page - PAGE_LEN)}>
        <i className="codicon codicon-triangle-left"></i>
      </VSCodeButton>
      <VSCodeButton onClick={() => setPage(page + PAGE_LEN >= dataset.length ? 0 : page + PAGE_LEN)}>
        <i className="codicon codicon-triangle-right"></i>
      </VSCodeButton>
    </div>
  </div>;
};
