"use server";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { foodProductsTable } from "../db/schema";
import { revalidatePath } from "next/cache";

export default async function deleteProduct(id: number) {
  await db.delete(foodProductsTable).where(eq(foodProductsTable.id, id));
  revalidatePath("/dashboard/food-database");
}
