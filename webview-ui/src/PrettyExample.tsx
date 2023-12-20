import { SampleInfo } from "../../src/datatypes";
import { Drawer } from "./Drawer";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return <div className="PrettyExample w-full">
    <pre className="w-full break-words whitespace-pre-wrap">
      {props.example.item}
    </pre>
    <div className="my-2 mx-0 w-full">
      Details <Drawer>
        <pre className="w-full break-words whitespace-pre-wrap">{JSON.stringify(props.example.metadata, null, 2)}</pre>
      </Drawer>
    </div>
  </div>;
};
