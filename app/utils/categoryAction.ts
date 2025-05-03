"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { foodCategoryTable, foodProductsTable, imageFoodProductsTable, imagesTable } from "../db/schema";
import { refreshFoodCategory, refreshFoodCategoryID } from "./revalidate";

export const addCategory = async (name: string, parentID?: number) => {
  await db
    .insert(foodCategoryTable)
    .values({
      name: name,
      parentCategory: parentID,
    });
  refreshFoodCategory();
}

export const editCategory = async (id: number, name: string) => {
  await db
    .update(foodCategoryTable)
    .set({
      name: name,
    })
    .where(eq(foodCategoryTable.id, id));
  refreshFoodCategory();
};

export const editCategoryImage = async (id: number, productID: number) => {
  const imageID = await db
    .select({
      image: imageFoodProductsTable.imageId,
    })
    .from(imageFoodProductsTable)
    .innerJoin(
      imagesTable,
      eq(imageFoodProductsTable.imageId, imagesTable.id)
    )
    .where(
      and(
        eq(imageFoodProductsTable.foodProductId, productID),
        eq(imageFoodProductsTable.type, "front")
      )
    )
    .orderBy(desc(imagesTable.uploadedAt));

  const image = imageID[0]?.image;

  await db
    .update(foodCategoryTable)
    .set({
      image: image,
    })
    .where(eq(foodCategoryTable.id, id));
  refreshFoodCategory();
};

export const mergeCategory = async (fromID: number, mergeToID: number) => {
  // const fromCategoryExists = await db.select().from(foodCategoryTable).where(eq(foodCategoryTable.id, fromID));
  // if (!fromCategoryExists || fromCategoryExists.length === 0) {
  //   throw new Error("From category does not exist");
  // }
  const toCategoryExists = await db
    .select()
    .from(foodCategoryTable)
    .where(eq(foodCategoryTable.id, mergeToID));
  if (!toCategoryExists || toCategoryExists.length === 0) {
    throw new Error("To category does not exist");
  }
  await db
    .update(foodProductsTable)
    .set({
      foodCategoryId: mergeToID,
    })
    .where(eq(foodProductsTable.foodCategoryId, fromID));
  await db.delete(foodCategoryTable).where(eq(foodCategoryTable.id, fromID));
  refreshFoodCategoryID();
};

export const arrangeCategory = async (categoryID: number, sequence: number) => {
  await db
    .update(foodCategoryTable)
    .set({
      sequence: sequence,
    })
    .where(eq(foodCategoryTable.id, categoryID));
  refreshFoodCategory();
}

export const changeFoodProductCategory = async (
  productID: number,
  categoryID: number
) => {
  await db
    .update(foodProductsTable)
    .set({ foodCategoryId: categoryID })
    .where(eq(foodProductsTable.id, productID));
  refreshFoodCategoryID();
};

export const deleteCategory = async (id: number) => {
  await db.delete(foodCategoryTable).where(eq(foodCategoryTable.id, id));
  refreshFoodCategory();
};
