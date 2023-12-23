import { SampleInfo } from "../../../src/datatypes";
import { PrettyExample } from "../PrettyExample";

type FailureInfoProps = {
  dataset: SampleInfo[];
}

export const FailureInfo = (props: FailureInfoProps) => {
  const failures = props.dataset.filter(x => x.outcome === "failed");

  return <div className="FailureInfo">
    <p>
      <strong>Important: This test failed on {failures.length} examples.</strong>&nbsp;
      Use the bucket chart below to inspect the failing and passing examples.
      <br />
      This is one failing example:
    </p>
    <PrettyExample example={failures[0]} />
  </div>;
};