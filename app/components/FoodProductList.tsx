import React from "react";
import FoodActions from "./FoodAction";
import CategoryProductAction from "./CategoryProductAction";
import Link from "next/link";
import ExpandImage from "./ExpandImage";
import { imagesTable } from "../db/schema";

export interface FoodProductDatabaseType {
  id: number;
  name: string | null;
  barcode: string[] | null;
  brand: string | null;
  category: string;
  categoryId: number | null;
  images: {
    front?: typeof imagesTable.$inferSelect;
    nutritional_table?: typeof imagesTable.$inferSelect;
    ingredients?: typeof imagesTable.$inferSelect;
  };
  verified: boolean | null;
}

export default function FoodProductList({
  data,
  actions = "product",
}: {
  data: FoodProductDatabaseType[];
  actions?: "product" | "category";
}) {
  const foodItems = data.map((item) => (
    <tr className="hover:bg-base-300 transition" key={item.id}>
      <th>{item.id}</th>
      <td>
        <div className="flex flex-row gap-2 flex-wrap">
          {item.barcode?.map((code) => (
            <span
              key={code}
              className="bg-gray-100 py-1 px-2 rounded hover:bg-gray-200 transition"
            >
              {code}
            </span>
          ))}
        </div>
      </td>
      <td>
        {/* TODO: Optimize by directly fetching from Open Food Facts, require db change */}
        {item.images.front?.imageKey && (
          <ExpandImage image={item.images.front?.imageKey} name={item.name} />
        )}
      </td>
      <td>
        <p className="font-bold">{item.name}</p>
        <p>{item.brand}</p>
      </td>
      <td>
        <Link
          href={`/dashboard/food-categories/${item.categoryId}`}
          className="hover:text-primary hover:underline transition"
          prefetch
        >
          {item.category}
        </Link>
      </td>
      <td>
        <div className="flex flex-row gap-2 flex-wrap justify-center items-center">
          <span
            className={`tooltip ${
              item.images.nutritional_table?.imageKey ? "tooltip-primary" : ""
            }`}
            data-tip={`Nutrition${
              item.images.nutritional_table?.imageKey ? "" : " unavailable"
            }`}
          >
            <span
              className={`icon-[material-symbols--nutrition] text-3xl ${
                item.images.nutritional_table?.imageKey
                  ? "text-primary"
                  : "text-gray-300"
              }`}
            ></span>
          </span>
          <span
            className={`tooltip ${
              item.images.ingredients?.imageKey ? "tooltip-primary" : ""
            }`}
            data-tip={`Ingredients${
              item.images.ingredients?.imageKey ? "" : " unavailable"
            }`}
          >
            <span
              className={`icon-[mdi--nutrition] text-3xl ${
                item.images.ingredients?.imageKey
                  ? "text-primary"
                  : "text-gray-300"
              }`}
            ></span>
          </span>
        </div>
      </td>
      <td>
        <div
          className="flex justify-center tooltip"
          data-tip={item.verified ? "Verified" : "Unverified"}
        >
          {item.verified ? (
            <span className="icon-[material-symbols--verified] text-4xl text-primary"></span>
          ) : (
            <span className="icon-[material-symbols--pending] text-3xl text-gray-400"></span>
          )}
        </div>
      </td>
      <td>
        {actions === "product" ? (
          <FoodActions id={item.id} />
        ) : (
          <CategoryProductAction id={item.id} />
        )}
      </td>
    </tr>
  ));

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Barcode</th>
            <th>Image Preview</th>
            <th>Name & Brand</th>
            <th>Food Category</th>
            <th className="text-center">Completeness</th>
            <th className="text-center">Verified</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{foodItems}</tbody>
      </table>
    </div>
  );
}
