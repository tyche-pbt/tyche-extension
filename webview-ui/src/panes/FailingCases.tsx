import { SampleInfo } from "../report";
import Card from "../ui/Card";
import { PrettyExample } from "../ui/PrettyExample";

type FailingCasesProps = {
  dataset: SampleInfo[];
}

export const FailingCases = (props: FailingCasesProps) => {
  const failures = props.dataset.filter(x => x.outcome === "failed");

  return <Card className="mt-2">
    <div className="mb-2">
      <div className="font-bold">Counter-examples</div>
    </div>
    {failures.reverse().slice(0, 5).map((x, i) =>
      <div className="my-1" key={`example-${i}`}>
        <PrettyExample example={x} />
      </div>)}
  </Card>;
};