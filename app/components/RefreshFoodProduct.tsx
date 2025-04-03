"use client";
import React from "react";
import { refreshFoodProduct } from "../utils/revalidate";

export default function RefreshFoodProduct() {
  return (
    <a
      className="cursor-pointer icon-[material-symbols--refresh] text-3xl hover:rotate-180 transition"
      onClick={() => refreshFoodProduct()}
    ></a>
  );
}
