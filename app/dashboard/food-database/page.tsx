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
import Form from "next/form";
import { searchProductsMS } from "@/app/utils/minisearch";
import { notFound } from "next/navigation";
import { Pagination } from "@/app/components/Pagination";
import { Metadata } from "next";
import VerifiedToggle from "@/app/components/VerifiedToggle";

export const metadata: Metadata = {
  title: "Food Database",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, search, verified } = await searchParams;
  const verifiedOnly = verified === "true" ? true : false;
  const productsPerPage = 30;

  let currPage = 0;
  if (typeof page === "string" && !isNaN(parseInt(page))) {
    currPage = parseInt(page);
  }

  let data;
  let totalPages = 0;
  if (typeof search === "string" && search.trim() !== "") {
    const { data: searchData, total } = await searchProductsMS(
      search,
      currPage,
      productsPerPage,
      verifiedOnly
    );
    data = searchData;
    totalPages = Math.ceil(total / productsPerPage);
  } else {
    // TODO: Bug - this does not tally with the below actual query
    const totalProductsQuery = await db
      .select({ count: count() })
      .from(foodProductsTable)
      .where(verifiedOnly ? eq(foodProductsTable.verified, true) : undefined);
    const totalProducts = totalProductsQuery[0].count;

    totalPages = Math.ceil(totalProducts / productsPerPage);

    // TODO: Convert to function?
    data = await db
      .selectDistinctOn([foodProductsTable.id], {
        id: foodProductsTable.id,
        name: foodProductsTable.name,
        barcode: foodProductsTable.barcode,
        brand: foodProductsTable.brand,
        category: foodCategoryTable.name,
        categoryId: foodProductsTable.foodCategoryId,
        imageKeys: sql<
          (typeof imagesTable.$inferSelect)[]
        >`json_agg(${imagesTable})`,
        imageType: sql<
          (typeof imageFoodProductsTable.$inferSelect)[]
        >`json_agg(${imageFoodProductsTable})`,
        verified: foodProductsTable.verified,
        hidden: foodProductsTable.hidden,
      })
      .from(foodProductsTable)
      .where(
        verifiedOnly ? eq(foodProductsTable.verified, verifiedOnly) : undefined
      )
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

    data = data.map((item) => {
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
  }

  if (!data || data.length === 0) {
    notFound();
  }

  return (
    <>
      <main className="mx-4 my-8 lg:m-8">
        <div className="flex flex-row gap-2 items-center">
          <span className="icon-[material-symbols--grocery] text-5xl mx-2"></span>
          <div>
            <h1 className="text-2xl font-bold">Food Database</h1>
            <p>Manage food items in the database.</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-base-100 rounded shadow">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 justify-items-center lg:justify-items-normal">
            <div className="flex flex-row gap-2 items-center">
              <Form action="/dashboard/food-database" className="join">
                <label className="input join-item">
                  <span className="icon-[material-symbols--search-rounded] text-2xl"></span>
                  <input
                    name="search"
                    type="search"
                    className="grow"
                    placeholder="Search"
                    defaultValue={search}
                  />
                </label>
                <button className="btn btn-primary join-item" type="submit">
                  Search
                </button>
              </Form>
              <VerifiedToggle verifiedOnly={verifiedOnly} />
            </div>

            <Pagination
              url="/dashboard/food-database"
              currPage={currPage}
              queries={
                typeof search === "string" ? `search=${search}` : undefined
              }
              totalPages={totalPages}
            />
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

          <FoodProductList data={data} actions="product" />
          <Pagination
            url="/dashboard/food-database"
            currPage={currPage}
            queries={
              typeof search === "string" ? `search=${search}` : undefined
            }
            totalPages={totalPages}
          />
        </div>
      </main>
    </>
  );
}
