import * as React from "react";
import { SampleInfo } from "./datatypes";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { PrettyExample } from "./PrettyExample";

type ExampleViewProps = {
  dataset: SampleInfo[];
};

export const ExampleView = (props: ExampleViewProps) => {
  return (<div className="ExampleView">
    {props.dataset.slice(0, 4).flatMap(x => [<VSCodeDivider />, <PrettyExample example={x} />]).slice(1)}
  </div>);
};
