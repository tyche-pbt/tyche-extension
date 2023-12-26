import { Disclosure } from "@headlessui/react";
import { SampleInfo } from "../../../src/datatypes";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return <div className="w-full">
    <Disclosure>
      {({ open }) => <>
        <Disclosure.Button as="pre" className={`text-sm w-full break-words whitespace-pre-wrap ${open ? "cursor-zoom-out" : "cursor-zoom-in"}`}>
          {props.example.item !== "" ? props.example.item :
            <span className="text-base">"(empty)"</span>}
        </Disclosure.Button>
        <Disclosure.Panel as="pre" className="mt-2 text-sm w-full break-words whitespace-pre-wrap">
          <div className="font-sans">Details:</div>
          {JSON.stringify(props.example.metadata, null, 2)}
        </Disclosure.Panel>
      </>}
    </Disclosure>
  </div>;
};
