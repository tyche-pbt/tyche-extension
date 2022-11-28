import { useState } from "react";
import { SampleInfo } from "./datatypes";
import { ExampleDOT } from "./ExampleDOT";

type PrettyExampleProps = {
  example: SampleInfo;
};
export const PrettyExample = (props: PrettyExampleProps) => {
  const [pretty, setPretty] = useState(true);

  if (!props.example.dot) {
    return <div><code>{props.example.item}</code></div>;
  }

  return <div className="PrettyExample">
    <div
      className="ee-example">
      {pretty ? <ExampleDOT
        onClickDOT={() => setPretty(false)}
        styleDOT={{ cursor: "zoom-in" }}
        dot={props.example.dot}
      ></ExampleDOT>
        : <div style={{ cursor: "zoom-out" }} onClick={() => setPretty(true)}><code>{props.example.item}</code></div>}
    </div>
  </div>;
};
