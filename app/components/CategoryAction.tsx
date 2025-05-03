"use client";
import React from "react";
import Link from "next/link";
import {
  addCategory,
  arrangeCategory,
  deleteCategory,
  editCategory,
  editCategoryImage,
  mergeCategory,
} from "../utils/categoryAction";
import { toast } from "react-toastify";

export default function CategoryAction({
  id,
  name,
  count,
  parentID,
  parentName,
  sequence,
  revalidate,
}: {
  id: number;
  name: string;
  count: number;
  sequence: number;
  parentID?: number;
  parentName?: string;
  revalidate?: () => Promise<void>;
}) {
  const isParent = id === parentID;
  const handleAdd = () => {
    const categoryName = prompt(`Enter name for the new ${parentName ? `subcategory under ${parentName}` : 'category'}:`);
    if (!categoryName) {
      return;
    }

    addCategory(categoryName, parentID).then(() => {
      if (revalidate) {
        revalidate();
      }
    }).catch((error) => {
      toast.error("An unexpected error occurred: " + error.message);
    });
  };

  const handleEdit = () => {
    const newName = prompt("Enter new name for the category:", name);
    if (newName) {
      editCategory(id, newName).then(() => {
        if (revalidate) {
          revalidate();
        }
      }).catch((error) => {
        toast.error("Error editing category: " + error.message);
      });
    }
  };

  const handleImage = () => {
    const imageUrl = prompt("Enter the product ID image for the category:", "");
    if (imageUrl) {
      editCategoryImage(id, parseInt(imageUrl)).then(() => {
        if (revalidate) {
          revalidate();
        }
      }).catch((error) => {
        toast.error("Error editing category image: " + error.message);
      });
    }
  }

  const handleMerge = () => {
    const mergeToID = prompt("Enter the ID of the category to merge into:");
    if (mergeToID) {
      const parsedID = parseInt(mergeToID);
      if (!isNaN(parsedID)) {
        mergeCategory(id, parsedID).then(() => {
          if (revalidate) {
            revalidate();
          }
        }).catch((error) => {
          toast.error("Error merging categories: " + error.message);
        });
      } else {
        toast.error("Invalid ID entered.");
      }
    }
  };

  const handleArrange = () => {
    const newSequence = prompt("Enter new sequence number for the category:", sequence.toString());
    if (newSequence) {
      const parsedSequence = parseInt(newSequence);
      if (!isNaN(parsedSequence)) {

        arrangeCategory(id, parsedSequence).then(() => {
          if (revalidate) {
            revalidate();
          }
        }).catch((error) => {
          toast.error("Error arranging category: " + error.message);
        });
      }
    }
  }

  const handleDelete = () => {
    const confirmDelete = confirm(
      count > 0
        ? "This category has food products. Are you sure you want to delete it? They will be moved to the 'Uncategorized' category."
        : `Are you sure you want to delete "${name}"?`
    );
    if (!confirmDelete) {
      return;
    }
    deleteCategory(id).then(() => {
      if (revalidate) {
        revalidate();
      }
    }).catch((error) => {
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
        {isParent ? (
          <span className="icon-[material-symbols--box-add] text-3xl text-gray-800 hover:text-primary transition"></span>
        ) : (
          <span className="icon-[material-symbols--add-circle] text-3xl text-gray-800 hover:text-primary transition"></span>
        )}
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
            title="Arrange"
            onClick={handleArrange}
          >
            <span className="icon-[material-symbols--sort] text-3xl text-gray-800 hover:text-primary transition"></span>
          </button>
          <button
            className="cursor-pointer"
            title="Delete"
            onClick={handleDelete}
          >
            <span className="icon-[mdi--bin] text-3xl text-gray-800 hover:text-error transition"></span>
          </button>
          {!isParent && <button
            className="cursor-pointer"
            title="Edit image"
            onClick={handleImage}
          >
            <span className="icon-[mdi--image-plus] text-3xl text-gray-800 hover:text-primary transition"></span>
          </button>}
        </>
      )}
    </span>
  );
}
