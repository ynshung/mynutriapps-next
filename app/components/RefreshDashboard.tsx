"use client";
import React from "react";
import { refreshDashboard } from "../utils/revalidate";

export default function RefreshDashboard() {
  return (
    <button
      className="btn btn-circle btn-lg btn-primary group"
      onClick={() => refreshDashboard()}
    >
      <span className="icon-[material-symbols--refresh] text-3xl group-hover:rotate-180 transition"></span>
    </button>
  );
}
