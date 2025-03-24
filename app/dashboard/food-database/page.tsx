import { db } from "@/app/db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "@/app/db/schema";
import { count, desc, eq } from "drizzle-orm";
import React from "react";
import Image from "next/image";
import FoodActions from "@/app/components/FoodAction";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page } = await searchParams;
  const productsPerPage = 10;

  let currPage = 0;
  if (typeof page === "string" && !isNaN(parseInt(page))) {
    currPage = parseInt(page);
  }

  const totalProductsQuery = await db
    .select({ count: count() })
    .from(foodProductsTable);
  const totalProducts = totalProductsQuery[0].count;

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  let foodItems = null;
  try {
    const data = await db
      .select({
        id: foodProductsTable.id,
        name: foodProductsTable.name,
        brand: foodProductsTable.brand,
        barcode: foodProductsTable.barcode,
        foodCategory: foodCategoryTable.name,
        imageKey: imagesTable.imageKey,
      })
      .from(foodProductsTable)
      .innerJoin(
        imageFoodProductsTable,
        eq(imageFoodProductsTable.foodProductId, foodProductsTable.id)
      )
      .innerJoin(
        imagesTable,
        eq(imageFoodProductsTable.imageId, imagesTable.id)
      )
      .innerJoin(
        foodCategoryTable,
        eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
      )
      .where(eq(imageFoodProductsTable.type, "front"))
      .orderBy(desc(foodProductsTable.id))
      .limit(productsPerPage)
      .offset(currPage * productsPerPage);

    foodItems = data.map((item) => (
      <tr className="hover:bg-base-300" key={item.id}>
        <th>{item.id}</th>
        <td>
          {item.barcode?.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </td>
        <td>
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_URL}/${item.imageKey}`}
            alt={item.name ?? "Food product image"}
            width={128}
            height={128}
            className="aspect-image h-full w-full max-w-52 object-cover"
          />
        </td>
        <td>{item.name}</td>
        <td>{item.brand}</td>
        <td>{item.foodCategory}</td>
        <td>
          <FoodActions id={item.id} />
        </td>
      </tr>
    ));
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="m-8">
      <h1 className="text-2xl font-bold">Food Database</h1>
      <p>Manage food items in the database.</p>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <div className="flex gap-2 mb-4">
          <Link
            href="/dashboard/food-database/new-product"
            className="btn btn-primary"
          >
            <span className="icon-[material-symbols--add] text-xl"></span> Add
            New
          </Link>
          <Link href="/dashboard/food-database/batch" className="btn btn-primary">
            <span className="icon-[lsicon--batch-add-filled] text-xl"></span>{" "}
            Batch Add
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Barcode</th>
                <th>Image Preview</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Food Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{foodItems}</tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <div className="join">
            {currPage !== 0 && <Link href={`/dashboard/food-database?page=${currPage - 1}`} className="join-item btn">«</Link>}
            <button className="join-item btn">Page {currPage + 1}</button>
            {totalPages > currPage + 1 && <Link href={`/dashboard/food-database?page=${currPage + 1}`} className="join-item btn">»</Link>}
          </div>
        </div>
      </div>
    </main>
  );
}
