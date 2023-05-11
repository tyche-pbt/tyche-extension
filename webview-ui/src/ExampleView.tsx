import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { PrettyExample } from "./PrettyExample";
import { useState } from "react";

type ExampleViewProps = {
  dataset: SampleInfo[];
  filter?: ExampleFilter;
};

const PAGE_LEN = 10;

export const ExampleView = (props: ExampleViewProps) => {
  const [page, setPage] = useState(0);

  const { filter } = props;

  const dataset = filter
    ? props.dataset.filter((x) => (!filter.filter || x.filters[filter.filter]) && x.features[filter.feature] === filter.value)
    : props.dataset;

  return (<div className="ExampleView">
    {filter &&
      <>
        <em>Examples where <code>{filter.feature} = {filter.value}</code> {filter.filter && <span> (filtered by <code>{filter.filter}</code>)</span>}</em>
        <VSCodeDivider style={{ marginBottom: "20px" }} />
      </>}
    {dataset.slice(page, page + PAGE_LEN).flatMap(x => [<VSCodeDivider />, <PrettyExample example={x} />]).slice(1)}
    <div className="page-buttons">
      <VSCodeButton onClick={() => setPage(page < PAGE_LEN ? dataset.length - PAGE_LEN : page - PAGE_LEN)}>
        ◀
      </VSCodeButton>
      <VSCodeButton onClick={() => setPage(page + PAGE_LEN >= dataset.length ? 0 : page + PAGE_LEN)}>
        ▶
      </VSCodeButton>
    </div>
  </div>);
};
