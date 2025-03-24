"use client";
import React from "react";
import ProductForm from "@/app/components/ProductForm";
import Link from "next/link";

export default function Page() {
  return (
    <main className="m-8">
      <div className="flex flex-row gap-4 items-center">
        <Link
          href="/dashboard/food-database"
          className="btn btn-circle btn-xl btn-ghost"
        >
          <span className="icon-[material-symbols--chevron-left-rounded] text-5xl"></span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Product</h1>
          <p>Add a new product to the food database.</p>
        </div>
      </div>
      <ProductForm />
    </main>
  );
}
