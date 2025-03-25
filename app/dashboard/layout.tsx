import React from "react";
import Drawer from "../components/Drawer";
import { UserProvider } from "../context/UserContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex">
        <Drawer>{children}</Drawer>
      </div>
    </UserProvider>
  );
}
