import Graphviz from "graphviz-react";
import { useState } from "react";
import useMeasure from "react-use-measure";
import "./ExampleDOT.scss";

type ExampleDOTProps = {
  dot: string;
  styleDOT?: React.CSSProperties;
  onClickDOT?: () => void;
};

export const ExampleDOT = (props: ExampleDOTProps) => {
  const [ref, { width }] = useMeasure();

  const [expanded, setExpanded] = useState(false);

  return <div className="ExampleDOT" ref={ref}>
    <div onClick={() => props.onClickDOT && props.onClickDOT()} style={props.styleDOT}>
      <Graphviz dot={props.dot} options={{ height: expanded ? width : 150, width }} ></Graphviz>
    </div>
    <div className="expander">
      <span onClick={e => setExpanded(!expanded)}>{expanded ? "⌃" : "⌄"}</span>
    </div>
  </div>;
};
