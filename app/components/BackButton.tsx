"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        const parentPath = window.location.pathname.substring(
          0,
          window.location.pathname.lastIndexOf("/")
        );
        if (window.history?.length && window.history.length > 1) {
          const currentPath = window.location.pathname;
          router.back();
          setTimeout(() => {
            if (currentPath === window.location.pathname) {
              console.log("Back button did not navigate to a different page.");
              router.replace(href || parentPath);
            }
          }, 500);
        } else {
          router.push(href || parentPath);
        }
      }}
      className="btn btn-circle btn-xl btn-ghost"
    >
      <span className="icon-[material-symbols--chevron-left-rounded] text-5xl"></span>
    </button>
  );
}
