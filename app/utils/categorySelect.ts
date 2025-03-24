'use server';
import { db } from '../db';
import { foodCategoryTable } from '../db/schema';

export default async function getCategories() {
  const data = await db
    .select({
      id: foodCategoryTable.id,
      name: foodCategoryTable.name,
      alias: foodCategoryTable.alias,
    })
    .from(foodCategoryTable)
    .orderBy(foodCategoryTable.id);
  
  return data.reduce<{ value: number; label: string }[]>((acc, category) => {
    acc.push({
      value: category.id,
      label: category.name,
    });
    return acc;
  }, []);
}
