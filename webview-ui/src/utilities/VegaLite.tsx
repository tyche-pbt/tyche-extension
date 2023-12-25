import Vega, { VegaProps } from "react-vega/lib/Vega";
import * as vl from "vega-lite";

const VegaLite = (props: VegaProps) => {
  const liteSpec = props.spec;
  const signals = "signals" in liteSpec ? liteSpec.signals || [] : [];

  const spec = vl.compile(liteSpec as vl.TopLevelSpec).spec;
  spec.signals = [...spec.signals || [], ...signals];

  return <Vega {...props} spec={spec} />;
};

export default VegaLite;