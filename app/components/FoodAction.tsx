"use client";
import React from "react";
import Link from "next/link";

export default function FoodActions({ id }: { id: number }) {
  const handleDelete = () => {
    console.log(`Deleting item with ID: ${id}`);
    // TODO: Dialog for confirmation
    // TODO: Call delete function
  };

  return (
    <span className="flex items-center gap-1">
      <Link href={`/dashboard/food-database/${id}`} className="cursor-pointer" title="Edit">
        <span className="icon-[mdi--edit] text-2xl text-black"></span>
      </Link>
      <button className="cursor-pointer" title="Delete" onClick={handleDelete}>
        <span className="icon-[mdi--bin] text-2xl text-black"></span>
      </button>
    </span>
  );
}
