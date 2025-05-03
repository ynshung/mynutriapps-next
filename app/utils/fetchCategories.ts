"use server";

import { db } from "../db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "../db/schema";
import {
  count,
  desc,
  eq,
  getTableColumns,
  sql,
} from "drizzle-orm";
import { notFound } from "next/navigation";

export const getCategoriesChildren = async (parentID: number) => {
  const query = await db
    .select({
      ...getTableColumns(foodCategoryTable),
      foodProductCount: count(foodProductsTable.foodCategoryId),
    })
    .from(foodCategoryTable)
    .leftJoin(
      foodProductsTable,
      eq(foodCategoryTable.id, foodProductsTable.foodCategoryId)
    )
    .groupBy(foodCategoryTable.id)
    .orderBy(foodCategoryTable.id)
    .where(eq(foodCategoryTable.parentCategory, parentID));

  return query;
};

export interface CategoryList {
  id: number;
  name: string;
  parentCategory: number | null;
  sequence: number;
  imageKey: string | null;
  children: {
    id: number;
    name: string;
    parentCategory: number | null;
    foodProductCount: number;
    sequence: number;
    imageKey: string | null;
  }[];
  foodProductCount: number;
}

// This function is related to server listCategory
export const getCategoriesParent = async () => {
  const query = await db
    .select({
      ...getTableColumns(foodCategoryTable),
      imageKey: imagesTable.imageKey,
      foodProductCount: count(foodProductsTable.id), // counting product IDs
    })
    .from(foodCategoryTable)
    .leftJoin(
      foodProductsTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .leftJoin(imagesTable, eq(foodCategoryTable.image, imagesTable.id))
    .groupBy(foodCategoryTable.id, imagesTable.imageKey)
    .orderBy(foodCategoryTable.sequence, foodCategoryTable.id);

  const typedQuery = query as (typeof foodCategoryTable.$inferSelect & {
    imageKey: string | null;
    foodProductCount: number;
  })[];

  const mainCategories = typedQuery.filter((category) => category.parentCategory === null);

  // Aggregate main categories and their children
  const aggregated = mainCategories.map((mainCategory) => {
    const children = typedQuery
      .filter((category) => category.parentCategory === mainCategory.id);

    return {
      ...mainCategory,
      children,
    };
  });

  return aggregated;
};

export const getCategoryProducts = async (categoryID: number) => {
  const categoryQuery = await db
    .select({
      id: foodCategoryTable.id,
      name: foodCategoryTable.name,
    })
    .from(foodCategoryTable)
    .where(eq(foodCategoryTable.id, categoryID))
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
    .orderBy(desc(foodProductsTable.id));

  return productQuery;
};
