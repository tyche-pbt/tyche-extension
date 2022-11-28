import { SampleInfo } from "./datatypes";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { PrettyExample } from "./PrettyExample";
import { useState } from "react";

type ExampleViewProps = {
  dataset: SampleInfo[];
};

export const ExampleView = (props: ExampleViewProps) => {
  const [page, setPage] = useState(0);

  return (<div className="ExampleView">
    {props.dataset.slice(page, page + 4).flatMap(x => [<VSCodeDivider />, <PrettyExample example={x} />]).slice(1)}
    <div className="page-buttons">
      <VSCodeButton onClick={() => setPage(page < 4 ? props.dataset.length - 4 : page - 4)}>
        ◀
      </VSCodeButton>
      <VSCodeButton onClick={() => setPage(page + 4 >= props.dataset.length ? 0 : page + 4)}>
        ▶
      </VSCodeButton>
    </div>
  </div>);
};
