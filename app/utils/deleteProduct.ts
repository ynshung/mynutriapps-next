"use server";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { foodProductsTable } from "../db/schema";
import { refreshFoodProduct } from "./revalidate";

export default async function deleteProduct(id: number) {
  await db.delete(foodProductsTable).where(eq(foodProductsTable.id, id));
  refreshFoodProduct();
}
