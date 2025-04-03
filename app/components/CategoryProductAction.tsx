"use client";
import Link from "next/link";
import React from "react";
import deleteProduct from "../utils/deleteProduct";
import { changeFoodProductCategory } from "../utils/categoryAction";

export default function CategoryProductAction({ id }: { id: number }) {
  return (
    <>
      <span className="flex items-center justify-center gap-1">
        <button
          className="cursor-pointer"
          title="Change category"
          onClick={async () => {
            const categoryID = prompt(
              "Enter the new category ID for this product"
            );
            if (categoryID) {
              await changeFoodProductCategory(id, parseInt(categoryID));
            }
          }}
        >
          <span className="icon-[material-symbols--category] text-3xl text-black hover:text-primary transition"></span>
        </button>
        <Link
          href={`/dashboard/food-database/${id}`}
          className="cursor-pointer"
          title="Edit"
        >
          <span className="icon-[mdi--edit] text-3xl text-black hover:text-primary-light transition"></span>
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
          <span className="icon-[mdi--bin] text-3xl text-black hover:text-error transition"></span>
        </button>
      </span>
    </>
  );
}
