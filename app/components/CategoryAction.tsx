"use client";
import React from "react";
import Link from "next/link";

export default function CategoryAction({ id }: { id: number }) {
  const handleEdit = () => {

  };
  const handleMerge = () => {
    console.log(`Merging item with ID: ${id}`);


  };
  
  const handleDelete = () => {
    console.log(`Deleting item with ID: ${id}`);
    // TODO: Dialog for confirmation
    // TODO: Call delete function
  };

  return (
    <span className="flex items-center gap-1">
      <Link href={`/dashboard/food-categories/${id}`} className="cursor-pointer" title="View Food Products">
        <span className="icon-[material-symbols--list] text-2xl text-base-content"></span>
      </Link>
      <button className="cursor-pointer" title="Edit" onClick={handleEdit}>
        <span className="icon-[mdi--pencil] text-2xl text-base-content"></span>
      </button>
      <button className="cursor-pointer" title="Merge" onClick={handleMerge}>
        <span className="icon-[material-symbols--merge] text-2xl text-base-content"></span>
      </button>
      <button className="cursor-pointer" title="Delete" onClick={handleDelete}>
        <span className="icon-[mdi--bin] text-2xl text-base-content"></span>
      </button>
    </span>
  );
}
