import { Transition } from "@headlessui/react";
import { PropsWithChildren } from "react";

type CardProps = {
  className?: string;
};

export const StaticCard = (props: PropsWithChildren<CardProps>) => {
  return (
    <div className={"relative bg-white rounded-md px-3 py-2 mx-1 my-1 shadow " + props.className}>
      {props.children}
    </div>
  );
};

const Card = (props: PropsWithChildren<CardProps>) => {
  return (
    <Transition
      appear={true}
      show={true}
      enter="transition-all duration-300"
      enterFrom="opacity-0 -translate-x-8"
      enterTo="opacity-100"
      as="div"
      className={"relative bg-white rounded-md px-3 py-2 mx-1 my-1 shadow " + props.className}>
      {props.children}
    </Transition>
  );
};

export default Card;
