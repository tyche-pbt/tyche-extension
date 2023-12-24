import { Transition } from "@headlessui/react";
import { PropsWithChildren } from "react";

const Card = (props: PropsWithChildren<{ className?: string }>) => {
  return <Transition
    appear={true}
    show={true}
    enter="transition-all duration-300"
    enterFrom="opacity-0 -translate-x-8"
    enterTo="opacity-100">
    <div className={"bg-white rounded-md px-3 py-2 mx-1 my-1 shadow " + props.className}>
      {props.children}
    </div>
  </Transition>;
};

export default Card;