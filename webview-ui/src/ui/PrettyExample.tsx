import { Disclosure } from "@headlessui/react";
import { SampleInfo } from "../report";

type PrettyExampleProps = {
  example: SampleInfo;
  highlightText?: string;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return (
    <div className="w-full">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              as="pre"
              className={`text-sm w-full break-words whitespace-pre-wrap ${
                open ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}>
              {props.example.item !== "" ? (
                <PrettyText text={props.example.item} highlightText={props.highlightText} />
              ) : (
                <span className="font-sans italic">(no representation)</span>
              )}
            </Disclosure.Button>
            <Disclosure.Panel
              as="pre"
              className="w-full mt-2 text-sm break-words whitespace-pre-wrap">
              <div className="font-sans">Details:</div>
              {JSON.stringify(props.example.dataLine, null, 2)}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

type PrettyTextProps = {
  text: string;
  highlightText?: string;
};

const PrettyText = (props: PrettyTextProps) => {
  const sections =
    props.highlightText != undefined && props.highlightText.length > 0
      ? props.text.split(new RegExp(`(${props.highlightText})`, "gi"))
      : [props.text];
  return (
    <>
      {sections.map((section, i) => (
        <span
          key={i}
          className={
            section.toLowerCase() === props.highlightText?.toLowerCase()
              ? "bg-accent bg-opacity-30"
              : ""
          }>
          {section}
        </span>
      ))}
    </>
  );
};
