import { Transition } from "@headlessui/react";
import { PropsWithChildren } from "react";

type CardProps = {
  className?: string;
};

const Card = (props: PropsWithChildren<CardProps>) => {
  return <Transition
    appear={true}
    show={true}
    enter="transition-all duration-300"
    enterFrom="opacity-0 -translate-x-8"
    enterTo="opacity-100">
    <div className={"relative bg-white rounded-md px-3 py-2 mx-1 my-1 shadow " + props.className}>
      {props.children}
    </div>
  </Transition>;
};

export default Card;