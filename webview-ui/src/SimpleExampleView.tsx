import { SampleInfo } from "./report";
import Card from "./ui/Card";
import { PrettyExample } from "./ui/PrettyExample";

type SimpleExampleViewProps = {
  dataset: SampleInfo[];
  closeExamples: () => void;
};

export const SimpleExampleView = ({ dataset, closeExamples }: SimpleExampleViewProps) => {
  return <>
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-10 px-3 py-2 bg-accent">
      <button onClick={closeExamples}>
        <i className="codicon codicon-close text-background" />
      </button>
    </div>
    <Card className="mb-2">
      <div className="text-lg font-bold">Samples</div>
      <div className="text-sm">
        This page shows the samples generated during testing.
      </div>
    </Card>
    <Card>
      <div className="w-full">
        {dataset.map((x, key) => (
          <div key={key}>
            <div className="my-4">
              <PrettyExample example={x} noExpand />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </Card>
  </>;
};