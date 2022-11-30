import { useState } from "react";
import { SampleInfo } from "./datatypes";
import { ExampleDOT } from "./ExampleDOT";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  const [pretty, setPretty] = useState(false);

  if (!props.example.dot) {
    return <div className="PrettyExample"><code>{props.example.item}</code></div>;
  }

  return <div className="PrettyExample">
    <div
      className="ee-example">
      {pretty ? <ExampleDOT
        onClickDOT={() => setPretty(false)}
        styleDOT={{ cursor: "zoom-in" }}
        dot={props.example.dot}
      ></ExampleDOT>
        : <div className="ee-example" style={{ cursor: "zoom-out" }} onClick={() => setPretty(true)}><code>{props.example.item}</code></div>}
    </div>
  </div>;
};
