import { Disclosure } from "@headlessui/react";
import { SampleInfo } from "../report";

type PrettyExampleProps = {
  example: SampleInfo;
  highlightText?: string;
  duplicateCount?: number;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return (
    <>
      <div className="w-full">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                as="div"
                className={`flex flex-row ${open ? "cursor-zoom-out" : "cursor-zoom-in"}`}>
                <pre className="w-full text-sm break-words whitespace-pre-wrap">
                  {props.example.item !== "" ? (
                    <PrettyText text={props.example.item} highlightText={props.highlightText} />
                  ) : (
                    <span className="font-sans italic">(no representation)</span>
                  )}
                </pre>
                <div className="flex flex-col justify-center">
                  {props.duplicateCount !== undefined && props.duplicateCount > 1 && (
                    <div className="flex items-center justify-center w-10 p-1 text-white rounded-full aspect-square bg-accent text-s">
                      {props.duplicateCount}&times;
                    </div>
                  )}
                </div>
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
    </>
  );
};

type PrettyTextProps = {
  text: string;
  highlightText?: string;
};

const PrettyText = (props: PrettyTextProps) => {
  const sections =
    props.highlightText !== undefined && props.highlightText.length > 0
      ? props.text.split(
          new RegExp(`(${props.highlightText.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi")
        )
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
