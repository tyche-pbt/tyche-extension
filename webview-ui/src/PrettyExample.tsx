import { SampleInfo } from "../../src/datatypes";
import { Drawer } from "./Drawer";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return <div className="PrettyExample">
    <pre>{props.example.item}</pre>
    <div className="my-2 mx-0">
      See more <Drawer>
        <pre>{JSON.stringify(props.example.metadata, null, 2)}</pre>
      </Drawer>
    </div>
  </div>;
};
