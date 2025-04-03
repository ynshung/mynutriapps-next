import { db } from "@/app/db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "@/app/db/schema";
import { count, desc, eq } from "drizzle-orm";
import React from "react";
import Link from "next/link";
import RefreshFoodProduct from "@/app/components/RefreshFoodProduct";
import FoodProductList from "@/app/components/FoodProductList";

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

  // TODO: Bug - this does not tally with the below actual query
  const totalProductsQuery = await db
    .select({ count: count() })
    .from(foodProductsTable);
  const totalProducts = totalProductsQuery[0].count;

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const data = await db
    .selectDistinctOn([foodProductsTable.id], {
      id: foodProductsTable.id,
      name: foodProductsTable.name,
      barcode: foodProductsTable.barcode,
      brand: foodProductsTable.brand,
      category: foodCategoryTable.name,
      categoryId: foodProductsTable.foodCategoryId,
      image: imagesTable.imageKey,
      verified: foodProductsTable.verified,
    })
    .from(foodProductsTable)
    .innerJoin(
      imageFoodProductsTable,
      eq(imageFoodProductsTable.foodProductId, foodProductsTable.id)
    )
    .innerJoin(imagesTable, eq(imageFoodProductsTable.imageId, imagesTable.id))
    .innerJoin(
      foodCategoryTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .where(eq(imageFoodProductsTable.type, "front"))
    .orderBy(desc(foodProductsTable.id))
    .limit(productsPerPage)
    .offset(currPage * productsPerPage);

  if (!data || data.length === 0) {
    return <div>No food products found</div>;
  }

  return (
    <main className="m-8">
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[material-symbols--grocery] text-5xl mx-2"></span>
        <div>
          <h1 className="text-2xl font-bold">Food Database</h1>
          <p>Manage food items in the database.</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 justify-items-center lg:justify-items-normal">
          <div className="flex gap-2 col-span-2 lg:col-span-1">
            <Link
              href="/dashboard/food-database/new-product"
              className="btn btn-primary"
            >
              <span className="icon-[material-symbols--add] text-xl"></span> Add
              New
            </Link>
            <Link
              href="/dashboard/food-database/batch"
              className="btn btn-primary"
            >
              <span className="icon-[lsicon--batch-add-filled] text-xl"></span>{" "}
              Batch Add
            </Link>
          </div>
          <div className="flex justify-center justify-self-center">
            <div className="join">
              {currPage !== 0 && (
                <Link
                  href={`/dashboard/food-database?page=${currPage - 1}`}
                  className="join-item btn"
                >
                  «
                </Link>
              )}
              <button className="join-item btn">Page {currPage + 1}</button>
              {totalPages > currPage + 1 && (
                <Link
                  href={`/dashboard/food-database?page=${currPage + 1}`}
                  className="join-item btn"
                >
                  »
                </Link>
              )}
            </div>
          </div>
          <div className="justify-self-center lg:justify-self-end self-center">
            <RefreshFoodProduct />
          </div>
        </div>

        <FoodProductList data={data} actions="product" />
        <div className="flex justify-center mt-4">
          <div className="join">
            {currPage !== 0 && (
              <Link
                href={`/dashboard/food-database?page=${currPage - 1}`}
                className="join-item btn"
              >
                «
              </Link>
            )}
            <button className="join-item btn">Page {currPage + 1}</button>
            {totalPages > currPage + 1 && (
              <Link
                href={`/dashboard/food-database?page=${currPage + 1}`}
                className="join-item btn"
              >
                »
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
