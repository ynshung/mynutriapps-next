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
        alias: foodCategoryTable.alias,
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
      <tr className="hover:bg-base-300" key={item.id}>
        <th>{item.id}</th>
        <td>{item.name}</td>
        <td>
          <ul>
            {item.alias
              ?.filter((alias) => alias !== item.name)
              .map((alias) => (
                <li key={alias}>{alias}</li>
              ))}
          </ul>
        </td>
        <td>{item.foodProductCount}</td>
        <td>
          <CategoryAction id={item.id} />
        </td>
      </tr>
    ));
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="m-8">
      <h1 className="text-2xl font-bold">Food Categories</h1>
      <p>Manage food categories in the database.</p>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <div className="flex gap-2 mb-4">
          <button className="btn btn-primary">
            <span className="icon-[material-symbols--add] text-xl"></span> Add
            New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Aliases</th>
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
