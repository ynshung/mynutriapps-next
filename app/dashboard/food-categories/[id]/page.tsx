import BackButton from "@/app/components/BackButton";
import FoodProductList from "@/app/components/FoodProductList";
import { Pagination } from "@/app/components/Pagination";
import { db } from "@/app/db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "@/app/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const categoryQuery = await db
    .select({
      name: foodCategoryTable.name,
    })
    .from(foodCategoryTable)
    .where(eq(foodCategoryTable.id, parseInt(id)))
    .execute();

  if (!categoryQuery || categoryQuery.length === 0) {
    notFound();
  }

  const category = categoryQuery[0];
  return {
    title: `${category.name} (Category)`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const productsPerPage = 25;
  const { id } = await params;
  const { page } = await searchParams;
  console.log("page", page);

  let currPage = 0;
  if (typeof page === "string" && !isNaN(parseInt(page))) {
    currPage = parseInt(page);
  }

  const categoryQuery = await db
    .select({
      id: foodCategoryTable.id,
      name: foodCategoryTable.name,
    })
    .from(foodCategoryTable)
    .where(eq(foodCategoryTable.id, parseInt(id)))
    .groupBy(foodCategoryTable.id)
    .execute();
  if (!categoryQuery || categoryQuery.length === 0) {
    notFound();
  }
  const category = categoryQuery[0];

  const totalProductsQuery = await db
    .select({ totalProducts: count() })
    .from(foodProductsTable)
    .where(eq(foodProductsTable.foodCategoryId, category.id));

  const { totalProducts } = totalProductsQuery[0];
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const productQuery = await db
    .selectDistinctOn([foodProductsTable.id], {
      id: foodProductsTable.id,
      name: foodProductsTable.name,
      barcode: foodProductsTable.barcode,
      brand: foodProductsTable.brand,
      category: foodCategoryTable.name,
      categoryId: foodProductsTable.foodCategoryId,
      imageKeys: sql<
        (typeof imagesTable.$inferSelect)[]
      >`json_agg(${imagesTable})`,
      imageType: sql<
        (typeof imageFoodProductsTable.$inferSelect)[]
      >`json_agg(${imageFoodProductsTable})`,
      verified: foodProductsTable.verified,
    })
    .from(foodProductsTable)
    .innerJoin(
      imageFoodProductsTable,
      eq(imageFoodProductsTable.foodProductId, foodProductsTable.id)
    )
    .innerJoin(imagesTable, eq(imageFoodProductsTable.imageId, imagesTable.id))
    .innerJoin(
      foodCategoryTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .where(eq(foodProductsTable.foodCategoryId, category.id))
    .groupBy(foodProductsTable.id, foodCategoryTable.name)
    .orderBy(desc(foodProductsTable.id))
    .limit(productsPerPage)
    .offset(currPage * productsPerPage);

  if (!productQuery || productQuery.length === 0) {
    notFound();
  }

  const newProductQuery = productQuery.map((item) => {
    const imageType = item.imageType;
    const imageKeys = item.imageKeys;
    const images = imageType.reduce((acc, image, index) => {
      acc[image.type] = imageKeys[index];
      return acc;
    }, {} as Record<string, { imageKey: string }>);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageKeys: _, imageType: __, ...rest } = item;
    return {
      ...rest,
      images,
    };
  });

  return (
    <main className="mx-4 my-8 lg:m-8">
      <div className="flex flex-row gap-4 items-center">
        <BackButton href="/dashboard/food-categories" />
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p>View the {totalProducts} products in this category.</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <Pagination
          url={`/dashboard/food-categories/${id}`}
          currPage={currPage}
          totalPages={totalPages}
        />
        <FoodProductList data={newProductQuery} actions="category" />
        <Pagination
          url={`/dashboard/food-categories/${id}`}
          currPage={currPage}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
