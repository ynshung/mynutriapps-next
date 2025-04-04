import BackButton from "@/app/components/BackButton";
import FoodProductList from "@/app/components/FoodProductList";
import { db } from "@/app/db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "@/app/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { AppProps } from "next/dist/shared/lib/router/router";
import { notFound } from "next/navigation";
import React from "react";

export default async function Page({ params }: AppProps) {
  const { id } = await params;
  const categoryQuery = await db
    .select({
      id: foodCategoryTable.id,
      name: foodCategoryTable.name,
      alias: foodCategoryTable.alias,
    })
    .from(foodCategoryTable)
    .where(eq(foodCategoryTable.id, parseInt(id)))
    .groupBy(foodCategoryTable.id)
    .execute();
  if (!categoryQuery || categoryQuery.length === 0) {
    notFound();
  }
  const category = categoryQuery[0];

  const productQuery = await db
    .selectDistinctOn([foodProductsTable.id], {
      id: foodProductsTable.id,
      name: foodProductsTable.name,
      barcode: foodProductsTable.barcode,
      brand: foodProductsTable.brand,
      category: foodCategoryTable.name,
      categoryId: foodProductsTable.foodCategoryId,
      imageKeys: sql<typeof imagesTable.$inferSelect[]>`json_agg(${imagesTable})`,
      imageType: sql<typeof imageFoodProductsTable.$inferSelect[]>`json_agg(${imageFoodProductsTable})`,
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
    .orderBy(desc(foodProductsTable.id));

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
    <main className="m-8">
      <div className="flex flex-row gap-4 items-center">
        <BackButton href="/dashboard/food-categories" />
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p>View the {productQuery.length} products in this category.</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <FoodProductList data={newProductQuery} actions="category" />
      </div>
    </main>
  );
}
