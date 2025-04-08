import { db } from "@/app/db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "@/app/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import React from "react";
import Link from "next/link";
import RefreshFoodProduct from "@/app/components/RefreshFoodProduct";
import FoodProductList from "@/app/components/FoodProductList";
import JumpPage from "@/app/components/JumpPage";

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
      imageKeys: sql<typeof imagesTable.$inferSelect[]>`json_agg(${imagesTable})`,
      imageType: sql<typeof imageFoodProductsTable.$inferSelect[]>`json_agg(${imageFoodProductsTable})`,
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
    .groupBy(
      foodProductsTable.id,
      foodProductsTable.name,
      foodProductsTable.barcode,
      foodProductsTable.brand,
      foodCategoryTable.name,
      foodProductsTable.foodCategoryId,
      foodProductsTable.verified
    )
    .orderBy(desc(foodProductsTable.id))
    .limit(productsPerPage)
    .offset(currPage * productsPerPage);

  if (!data || data.length === 0) {
    return (
      <main className="m-8">
        <div className="flex flex-row gap-2 items-center">
          <span className="icon-[material-symbols--grocery] text-5xl mx-2"></span>
          <div>
            <h1 className="text-2xl font-bold">Food Database</h1>
            <p>Manage food items in the database.</p>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-8 mt-4 p-4 bg-base-100 text-center rounded shadow justify-center items-center min-h-52">
          <div className="flex flex-row gap-2 items-center">
            <span className="icon-[material-symbols--error] text-4xl"></span>
            <p className="text-lg font-bold">No product found</p>
          </div>
          {currPage !== 0 ? (
            <Link href="/dashboard/food-database" className="btn btn-primary">
              <span className="icon-[material-symbols--first-page] text-3xl"></span>
              Go to First Page
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/food-database/new-product"
                className="btn btn-primary transition"
                title="Add Product"
              >
                <span className="icon-[material-symbols--add] text-2xl"></span>
                Add Product
              </Link>
              <Link
                href="/dashboard/food-database/batch"
                className="btn btn-primary transition"
                title="Batch Add Product"
              >
                <span className="icon-[material-symbols--shadow-add] text-2xl"></span>
                Batch Add
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }
  
  const newData = data.map((item) => {
    const imageType = item.imageType;
    const imageKeys = item.imageKeys;
    const images = imageType.reduce((acc, image, index) => {
      acc[image.type] = imageKeys[index];
      return acc;
    }, {} as Record<string, { imageKey: string }>);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageKeys: _, imageType: __, ...rest } = item;
    return {
      ...rest,
      images,
    };
  });

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
          <div className="">
            <label className="input min-w-40">
              <span className="icon-[material-symbols--search] text-3xl"></span>
              <input type="search" className="grow" placeholder="Search" />
            </label>
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
              <JumpPage currPage={currPage} />
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
          <div className="col-span-2 lg:col-span-1 justify-self-center lg:justify-self-end self-center flex gap-2 items-center">
            <Link
              href="/dashboard/food-database/new-product"
              className="btn btn-primary btn-circle transition"
              title="Add Product"
            >
              <span className="icon-[material-symbols--add] text-2xl"></span>
            </Link>
            <Link
              href="/dashboard/food-database/batch"
              className="btn btn-primary btn-circle transition"
              title="Batch Add Product"
            >
              <span className="icon-[material-symbols--shadow-add] text-2xl"></span>
            </Link>
            <RefreshFoodProduct />
          </div>
        </div>

        <FoodProductList data={newData} actions="product" />
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
            <JumpPage currPage={currPage} />
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
