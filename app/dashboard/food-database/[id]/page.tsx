import ProductForm from "@/app/components/ProductForm";
import Link from "next/link";
import React from "react";

export default async function Page({ params }: { params: { id: string } }) {
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
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p>Edit the product in the food database.</p>
        </div>
      </div>

      <ProductForm editingProduct={parseInt((await params).id)} />
    </main>
  );
}
