import { useState } from "react";

type TooltipProps = {
  children: React.ReactNode;
};

const Tooltip = (props: TooltipProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return <div className="inline-block relative">
    <i className="codicon codicon-info cursor-pointer"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)} />
    {open &&
      <div className="absolute w-56 bg-foreground text-white p-2 z-50 text-xs rounded-md bg-opacity-80">
        {props.children}
      </div>}
  </div>;
}

export default Tooltip;