import React from "react";
import FoodActions from "./FoodAction";
import CategoryProductAction from "./CategoryProductAction";
import Link from "next/link";
import ExpandImage from "./ExpandImage";

export default function FoodProductList({
  data,
  actions = "product",
}: {
  data: {
    id: number;
    name: string | null;
    barcode: string[] | null;
    brand: string | null;
    category: string;
    categoryId: number | null;
    image: string;
    verified: boolean | null;
  }[];
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
        <ExpandImage
          image={item.image}
          name={item.name}
        />
      </td>
      <td>{item.name}</td>
      <td>{item.brand}</td>
      <td><Link href={`/dashboard/food-categories/${item.categoryId}`} className="hover:text-primary hover:underline transition">{item.category}</Link></td>
      <td>
        <div className="text-center">
          {item.verified ? (
            <span
              title="Verified"
              className="icon-[material-symbols--verified] text-3xl text-primary"
            ></span>
          ) : (
            <span
              title="Pending"
              className="icon-[material-symbols--pending] text-3xl text-gray-400"
            ></span>
          )}
        </div>
      </td>
      <td>{actions === "product" ? <FoodActions id={item.id} /> : <CategoryProductAction id={item.id} />}</td>
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
            <th>Name</th>
            <th>Brand</th>
            <th>Food Category</th>
            <th className="text-center">Verified</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>{foodItems}</tbody>
      </table>
    </div>
  );
}
