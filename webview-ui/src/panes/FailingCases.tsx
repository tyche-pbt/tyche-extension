import { SampleInfo } from "../../../src/datatypes";
import { PrettyExample } from "../PrettyExample";

type FailingCasesProps = {
  dataset: SampleInfo[];
}

export const FailingCases = (props: FailingCasesProps) => {
  const failures = props.dataset.filter(x => x.outcome === "failed");
  console.log(failures);

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