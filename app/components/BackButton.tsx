"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (window.history?.length && window.history.length > 1) {
          router.back();
        } else {
          router.push(href || "/");
        }
      }}
      className="btn btn-circle btn-xl btn-ghost"
    >
      <span className="icon-[material-symbols--chevron-left-rounded] text-5xl"></span>
    </button>
  );
}
