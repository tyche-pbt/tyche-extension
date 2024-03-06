import { useState } from "react";

type TooltipProps = {
  children: React.ReactNode;
  icon?: string;
};

const Tooltip = (props: TooltipProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const icon = props.icon || "codicon-info";

  return (
    <div className="inline-block relative break-words">
      <i
        className={`codicon cursor-pointer ${icon}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      />
      {open && (
        <div className="absolute w-56 bg-foreground text-white p-2 z-50 text-xs rounded-md bg-opacity-80">
          {props.children}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
