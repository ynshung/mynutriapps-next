import BackButton from "@/app/components/BackButton";
import ProductForm from "@/app/components/ProductForm";
import { AppProps } from "next/dist/shared/lib/router/router";
import React from "react";

export default async function Page({ params }: AppProps) {
  const { id } = await params;
  return (
    <main className="m-8">
      <div className="flex flex-row gap-4 items-center">
        <BackButton href="/dashboard/food-database" />
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p>Edit the product in the food database.</p>
        </div>
      </div>

      <ProductForm editingProduct={parseInt(id)} />
    </main>
  );
}
