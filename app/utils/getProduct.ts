"use server";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { foodCategoryTable, foodProductsTable, imageFoodProductsTable, imagesTable, nutritionInfoTable } from "../db/schema";
import { ServerFoodProductDetails } from "../db/types";

export const getProduct = async (id: number) => {
  const data = await db
    .select()
    .from(foodProductsTable)
    .where(eq(foodProductsTable.id, id))
    .leftJoin(
      nutritionInfoTable,
      eq(foodProductsTable.id, nutritionInfoTable.foodProductId)
    )
    .innerJoin(
      imageFoodProductsTable,
      eq(imageFoodProductsTable.foodProductId, foodProductsTable.id)
    )
    .innerJoin(imagesTable, eq(imageFoodProductsTable.imageId, imagesTable.id))
    .innerJoin(
      foodCategoryTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .orderBy(desc(imagesTable.uploadedAt)) // Get the latest image

  const foodProduct = data[0];
  if (!foodProduct) {
    return null;
  }

  // Process images
  const foodProductDetails: ServerFoodProductDetails = {
    ...foodProduct,
    images: [],
    nutrition_info: foodProduct.nutrition_info,
  };
  for (const obj of data) {
    const existingImage = foodProductDetails.images.find(
      (img) => img.id === obj.images.id
    );
    if (!existingImage) {
      foodProductDetails.images.push({
        ...obj.images,
        type: obj.image_food_products.type ?? "other",
      });
    }
  }
  return foodProductDetails;
};
