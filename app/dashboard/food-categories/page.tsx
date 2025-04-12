import { db } from "@/app/db";
import { foodCategoryTable, foodProductsTable } from "@/app/db/schema";
import React from "react";
import CategoryAction from "@/app/components/CategoryAction";
import { count, eq } from "drizzle-orm";

export default async function Page() {
  let foodItems = null;
  try {
    const data = await db
      .select({
        id: foodCategoryTable.id,
        name: foodCategoryTable.name,
        foodProductCount: count(foodProductsTable.foodCategoryId),
      })
      .from(foodCategoryTable)
      .leftJoin(
        foodProductsTable,
        eq(foodCategoryTable.id, foodProductsTable.foodCategoryId)
      )
      .groupBy(foodCategoryTable.id)
      .orderBy(foodCategoryTable.id);

    foodItems = data.map((item) => (
      <tr className="hover:bg-base-300 transition" key={item.id}>
        <th>{item.id}</th>
        <td>{item.name}</td>
        <td>{item.foodProductCount}</td>
        <td>
          <CategoryAction id={item.id} name={item.name} count={item.foodProductCount} />
        </td>
      </tr>
    ));
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="m-8">
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[material-symbols--category] text-5xl mx-2"></span>
        <div>
          <h1 className="text-2xl font-bold">Food Categories</h1>
          <p>Manage food categories in the database.</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{foodItems}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
