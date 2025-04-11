"use client";
import React from "react";
import Link from "next/link";
import {
  addCategory,
  deleteCategory,
  editCategory,
  mergeCategory,
} from "../utils/categoryAction";
import { toast } from "react-toastify";

export default function CategoryAction({
  id,
  name,
  count,
}: {
  id: number;
  name: string;
  count: number;
}) {
  const handleAdd = () => {
    const categoryName = prompt("Enter name for the new category:");
    if (!categoryName) {
      return;
    }
    const categoryID = prompt(
      "Enter ID for the new category:",
      (id + 1).toString()
    );
    const parsedID = parseInt(categoryID ?? "");
    if (isNaN(parsedID)) {
      toast.error("Invalid ID entered.");
      return;
    }

    addCategory(parsedID, categoryName).catch((error) => {
      if (error.message.includes("duplicate")) {
        toast.error(
          "Category ID already exists. Please choose a different ID."
        );
      } else {
        toast.error("An unexpected error occurred: " + error.message);
      }
    });
  };

  const handleEdit = () => {
    const newName = prompt("Enter new name for the category:", name);
    if (newName) {
      editCategory(id, newName).catch((error) => {
        toast.error("Error editing category: " + error.message);
      });
    }
  };

  const handleMerge = () => {
    const mergeToID = prompt("Enter the ID of the category to merge into:");
    if (mergeToID) {
      const parsedID = parseInt(mergeToID);
      if (!isNaN(parsedID)) {
        mergeCategory(id, parsedID).catch((error) => {
          toast.error("Error merging categories: " + error.message);
        });
      } else {
        toast.error("Invalid ID entered.");
      }
    }
  };

  const handleDelete = () => {
    const confirmDelete = confirm(
      count > 0
        ? "This category has food products. Are you sure you want to delete it? They will be moved to the 'Uncategorized' category."
        : `Are you sure you want to delete "${name}"?`
    );
    if (!confirmDelete) {
      return;
    }
    deleteCategory(id).catch((error) => {
      toast.error("Error deleting category: " + error.message);
    });
  };

  return (
    <span className="flex items-center gap-1">
      <Link
        href={`/dashboard/food-categories/${id}`}
        className="cursor-pointer"
        title="View food product list"
      >
        <span className="icon-[material-symbols--list-alt-outline] text-3xl text-primary hover:text-secondary transition"></span>
      </Link>
      <button
        className="cursor-pointer"
        title="Add category"
        onClick={handleAdd}
      >
        <span className="icon-[material-symbols-light--add-row-below] text-3xl text-gray-800 hover:text-primary transition"></span>
      </button>
      {id !== 0 && (
        <>
          <button
            className="cursor-pointer"
            title="Edit name"
            onClick={handleEdit}
          >
            <span className="icon-[mdi--pencil] text-3xl text-gray-800 hover:text-primary transition"></span>
          </button>
          <button
            className="cursor-pointer"
            title="Merge"
            onClick={handleMerge}
          >
            <span className="icon-[material-symbols--merge] text-3xl text-gray-800 hover:text-primary transition"></span>
          </button>
          <button
            className="cursor-pointer"
            title="Delete"
            onClick={handleDelete}
          >
            <span className="icon-[mdi--bin] text-3xl text-gray-800 hover:text-error transition"></span>
          </button>
        </>
      )}
    </span>
  );
}
