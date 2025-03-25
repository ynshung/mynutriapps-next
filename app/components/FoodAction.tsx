"use client";
import Link from "next/link";
import React from "react";
import deleteProduct from "../utils/deleteProduct";

export default function FoodActions({ id }: { id: number }) {
  return (
    <>
      <span className="flex items-center gap-1">
        <Link
          href={`/dashboard/food-database/${id}`}
          className="cursor-pointer"
          title="Edit"
        >
          <span className="icon-[mdi--edit] text-2xl text-black"></span>
        </Link>
        <button
          className="cursor-pointer"
          title="Delete"
          onClick={async () => {
            const confirmDelete = confirm(
              "Are you sure you want to delete this product?"
            );
            if (confirmDelete) {
              await deleteProduct(id);
            }
          }}
        >
          <span className="icon-[mdi--bin] text-2xl text-black"></span>
        </button>
      </span>
    </>
  );
}
