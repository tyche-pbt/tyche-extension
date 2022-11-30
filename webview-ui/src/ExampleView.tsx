import { SampleInfo } from "./datatypes";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { PrettyExample } from "./PrettyExample";
import { useState } from "react";

type ExampleViewProps = {
  dataset: SampleInfo[];
};

const PAGE_LEN = 10;

export const ExampleView = (props: ExampleViewProps) => {
  const [page, setPage] = useState(0);

  return (<div className="ExampleView">
    {props.dataset.slice(page, page + PAGE_LEN).flatMap(x => [<VSCodeDivider />, <PrettyExample example={x} />]).slice(1)}
    <div className="page-buttons">
      <VSCodeButton onClick={() => setPage(page < PAGE_LEN ? props.dataset.length - PAGE_LEN : page - PAGE_LEN)}>
        ◀
      </VSCodeButton>
      <VSCodeButton onClick={() => setPage(page + PAGE_LEN >= props.dataset.length ? 0 : page + PAGE_LEN)}>
        ▶
      </VSCodeButton>
    </div>
  </div>);
};
