import React from "react";
import Drawer from "../components/Drawer";
import { UserProvider } from "../context/UserContext";
import { ModalProvider } from "../context/ModalContext";
import { ToastContainer } from "react-toastify";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ModalProvider>
        <div className="flex">
          <Drawer>{children}</Drawer>
        </div>
        <ToastContainer />
      </ModalProvider>
    </UserProvider>
  );
}
