"use client";
import React from "react";
import ProductForm from "@/app/components/ProductForm";
import BackButton from "@/app/components/BackButton";

export default function Page() {
  return (
    <main className="mx-4 my-8 lg:m-8">
      <div className="flex flex-row gap-4 items-center">
        <BackButton href="/dashboard/food-database" />
        <div>
          <h1 className="text-2xl font-bold">New Product</h1>
          <p>Add a new product to the food database.</p>
        </div>
      </div>
      <ProductForm />
    </main>
  );
}
