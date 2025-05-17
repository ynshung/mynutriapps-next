"use client";
import React from "react";
import { refreshReports } from "../utils/revalidate";

export default function RefreshReport() {
  return (
    <a
      className="cursor-pointer icon-[material-symbols--refresh] text-3xl hover:rotate-180 transition"
      onClick={() => refreshReports()}
    ></a>
  );
}
