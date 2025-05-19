"use client";

import React from "react";

export default function VerifiedToggle({
  verifiedOnly,
}: {
  verifiedOnly: boolean;
}) {
  const verifiedToggle = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("verified", !verifiedOnly ? "true" : "false");
    window.location.href = url.toString();
  };
  return (
    <button
      className={`btn btn-primary btn-circle btn-outline ${
        verifiedOnly ? "btn-active" : ""
      }`}
      onClick={verifiedToggle}
      title="Show Verified Products"
    >
      <span className="icon-[material-symbols--verified] text-2xl"></span>
    </button>
  );
}
