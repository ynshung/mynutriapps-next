"use server";

import { revalidatePath } from "next/cache";

export const refreshFoodProduct = async () => {
  revalidatePath("/dashboard/food-database");
};

export const refreshFoodCategory = async () => {
  revalidatePath("/dashboard/food-categories");
};

export const refreshFoodCategoryID = async () => {
  revalidatePath("/dashboard/food-categories/[id]");
};
