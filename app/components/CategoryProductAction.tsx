"use client";
import Link from "next/link";
import React from "react";
import deleteProduct from "../utils/deleteProduct";
import { changeFoodProductCategory } from "../utils/categoryAction";
import { useModal } from "../context/ModalContext";
import dynamic from "next/dynamic";
import { getCategories } from "../utils/categorySelect";
import { GroupBase, Options, SelectInstance } from "react-select";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function CategoryProductAction({
  id,
  category,
}: {
  id: number;
  category: number;
}) {
  const { showModal, hideModal } = useModal();
  const selectRef =
    React.useRef<SelectInstance<unknown, boolean, GroupBase<unknown>>>(null);

  const handleChangeCategory = async () => {
    const categories = await getCategories();
    const stopFocus = setInterval(() => {
      if (selectRef.current) {
        selectRef.current.focus();
        clearInterval(stopFocus);
      }
    }, 100);
    console.log(
      category,
      categories.find((cat) => cat.value === category)?.label
    );

    showModal(
      <div className="items-center flex flex-col p-4 h-full min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Change Category</h2>
        <p className="mb-4">Select the new category for this product.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const categoryID = selectRef.current?.getValue() as
              | Options<{
                  label: string;
                  value: number;
                }>
              | undefined;
            if (categoryID) {
              hideModal();
              if (categoryID[0].value !== category) {
                await changeFoodProductCategory(id, categoryID[0].value);
              }
            }
          }}
          className="flex flex-col gap-4 justify-center items-center"
        >
          <Select
            name="category"
            placeholder="Search..."
            options={categories}
            defaultValue={
              categories.find((cat) => cat.value === category) ?? null
            }
            className="w-xs text-sm"
            autoFocus
            ref={selectRef}
          />
          <div className="flex flex-row gap-2 justify-center items-center">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <p className="text-sm">or <kbd className="kbd kbd-sm">Enter ↵</kbd></p>
          </div>
        </form>
      </div>,
      false
    );
  };

  return (
    <>
      <span className="flex items-center justify-center gap-1">
        <button
          className="cursor-pointer"
          title="Change category"
          onClick={handleChangeCategory}
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
