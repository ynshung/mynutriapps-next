"use server";

import { db } from "../db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "../db/schema";
import {
  aliasedTable,
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
  children: {
    id: number;
    name: string;
    parentCategory: number | null;
    foodProductCount: number;
  }[];
  foodProductCount: number;
}

export const getCategoriesParent = async () => {
  const childCategory = aliasedTable(foodCategoryTable, "childCategory");
  const foodProductChildCategory = aliasedTable(
    foodProductsTable,
    "foodProductChildCategory"
  );
  const query = await db
    .select({
      ...getTableColumns(foodCategoryTable),
      children: {
        ...getTableColumns(childCategory),
        foodProductCount: count(foodProductChildCategory.id), // counting product IDs
      },
      foodProductCount: count(foodProductsTable.id), // counting product IDs
    })
    .from(foodCategoryTable)
    .leftJoin(
      childCategory,
      eq(childCategory.parentCategory, foodCategoryTable.id)
    )
    .leftJoin(
      foodProductChildCategory,
      eq(foodProductChildCategory.foodCategoryId, childCategory.id)
    )
    .leftJoin(
      foodProductsTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .groupBy(foodCategoryTable.id, childCategory.id)
    .orderBy(foodCategoryTable.id);

  const typedQuery = query as (typeof foodCategoryTable.$inferSelect & {
    children:
      | (typeof foodCategoryTable.$inferSelect & {
          foodProductCount: number;
        })
      | null;
    foodProductCount: number;
  })[];

  const addedIDs = new Set<number>();
  // Sorting by parentCategory to prevent duplication
  const sortedQuery = typedQuery.sort((a, b) => {
    if (a.parentCategory === b.parentCategory) {
      return a.id - b.id;
    }
    return (a.parentCategory ?? 0) - (b.parentCategory ?? 0);
  });

  const aggregated = sortedQuery.reduce<CategoryList[]>((acc, curr) => {
    const existingParent = acc.find((item) => item.id === curr.id);

    if (existingParent && curr.children) {
      if (curr.children !== null && !existingParent.children.some((child) => child.id === curr.children!.id)) {
        existingParent.children.push(curr.children);
      }
      addedIDs.add(curr.id);
      addedIDs.add(curr.children.id);
    } else if (!addedIDs.has(curr.id)) {
      acc.push({
        ...curr,
        children: curr.children ? [curr.children] : [],
        foodProductCount: curr.foodProductCount,
      });
      addedIDs.add(curr.id);
      if (curr.children) {
        addedIDs.add(curr.children.id);
      }
    }
    return acc;
  }, []);

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
