import { useState } from "react";
import { SampleInfo } from "./datatypes";
import { toDOT } from "./dotUtils";
import { ExampleDOT } from "./ExampleDOT";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  const [pretty, setPretty] = useState(false);

  let dot = props.example.json ? toDOT(props.example.json) : props.example.dot;

  if (!dot) {
    return <div className="PrettyExample"><code>{props.example.item}</code></div>;
  }

  return <div className="PrettyExample">
    <div
      className="ee-example">
      {pretty ? <ExampleDOT
        onClickDOT={() => setPretty(false)}
        styleDOT={{ cursor: "zoom-in" }}
        dot={dot}
      ></ExampleDOT>
        : <div className="ee-example" style={{ cursor: "zoom-out" }} onClick={() => setPretty(true)}><code>{props.example.item}</code></div>}
    </div>
  </div>;
};
