import { SampleInfo } from "../../../src/datatypes";
import Card from "../ui/Card";
import { PrettyExample } from "../ui/PrettyExample";

type FailingCasesProps = {
  dataset: SampleInfo[];
}

export const FailingCases = (props: FailingCasesProps) => {
  const failures = props.dataset.filter(x => x.outcome === "failed");

  return <Card>
    <div className="mb-2">
      <div className="font-bold">Counter-examples</div>
    </div>
    <PrettyExample example={failures[failures.length - 1]} />
  </Card>;
};