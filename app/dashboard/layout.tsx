import React from "react";
import Drawer from "../components/Drawer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Drawer>{children}</Drawer>
    </div>
  );
}
