import { Disclosure } from "@headlessui/react";
import { SampleInfo } from "../report";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return <div className="w-full">
    <Disclosure>
      {({ open }) => <>
        <Disclosure.Button as="pre" className={`text-sm w-full break-words whitespace-pre-wrap ${open ? "cursor-zoom-out" : "cursor-zoom-in"}`}>
          {props.example.item !== ""
            ? props.example.item
            : <span className="font-sans italic">(no representation)</span>}
        </Disclosure.Button>
        <Disclosure.Panel as="pre" className="mt-2 text-sm w-full break-words whitespace-pre-wrap">
          <div className="font-sans">Details:</div>
          {JSON.stringify(props.example.dataLine, null, 2)}
        </Disclosure.Panel>
      </>}
    </Disclosure>
  </div>;
};
