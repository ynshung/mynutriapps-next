"use client";
import { UserProvider } from "@/app/context/UserContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
