import { ReactNode, useState } from "react";

type DrawerState = "open" | "closed";

type DrawerProps = {
  open?: boolean;
  children: ReactNode;
};

export const Drawer = (props: DrawerProps) => {
  const [drawerState, setDrawerState] = useState<DrawerState>(props.open ? "open" : "closed");

  if (drawerState === "closed") {
    return <span onClick={() => setDrawerState("open")}>
      &nbsp;<i className="codicon codicon-chevron-right icon-click" />
    </span>;
  } else {
    return <>
      <span onClick={() => setDrawerState("closed")}>
        &nbsp;<i className="codicon codicon-chevron-down icon-click" />
      </span>
      {props.children}
    </>;
  }
};