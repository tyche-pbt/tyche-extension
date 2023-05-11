import { SampleInfo } from "../../src/datatypes";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return <div className="PrettyExample"><pre>{props.example.item}</pre></div>;
};
