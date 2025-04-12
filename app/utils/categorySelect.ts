'use server';
import { eq } from 'drizzle-orm';
import { CategorySelect } from '../dashboard/food-database/new-product/types';
import { db } from '../db';
import { foodCategoryTable } from '../db/schema';

export async function getCategories() {
  const data = await db
    .select({
      id: foodCategoryTable.id,
      name: foodCategoryTable.name,
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

export async function getCategoriesSelect(id: number): Promise<CategorySelect> {
  const categoryArray = await db
    .select({
      id: foodCategoryTable.id,
      name: foodCategoryTable.name,
    })
    .from(foodCategoryTable)
    .where(eq(foodCategoryTable.id, id))
    .limit(1);

  const category = categoryArray[0];

  if (!category) {
    throw new Error('Category not found');
  }

  return {
    value: category.id,
    label: category.name,
  };
}

