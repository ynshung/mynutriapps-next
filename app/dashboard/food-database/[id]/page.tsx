import BackButton from "@/app/components/BackButton";
import ProductForm from "@/app/components/ProductForm";
import { db } from "@/app/db";
import { foodProductsTable } from "@/app/db/schema";
import { count, eq } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
 
export const metadata: Metadata = {
  title: 'Edit Product',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db
    .select({ count: count() })
    .from(foodProductsTable)
    .where(eq(foodProductsTable.id, parseInt(id)));

  console.log(product);
  if (product[0].count === 0) {
    notFound();
  }

  return (
    <main className="mx-4 my-8 lg:m-8">
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
