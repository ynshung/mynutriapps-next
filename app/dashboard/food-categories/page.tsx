"use client";

import CategoryAction from "@/app/components/CategoryAction";
import { CategoryList, getCategoriesParent } from "@/app/utils/fetchCategories";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [foodCategories, setFoodCategories] = useState<CategoryList[]>();

  const fetchCategories = async () => {
    const categories = await getCategoriesParent();
    setFoodCategories(categories);
  };

  useEffect(() => {
    document.title = "Food Categories - MyNutriApps Admin";
    fetchCategories();
  }, []);

  return (
    <main className="mx-4 my-8 lg:m-8">
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
                <th>Subcategory</th>
                <th>Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foodCategories?.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="">
                    <th>{item.id}</th>
                    <td rowSpan={item.children.length === 0 ? 1 : item.children.length + 1} className="font-bold">{item.name}</td>
                    <td className="italic">Main Category</td>
                    <td>{item.foodProductCount > 0 && item.foodProductCount}</td>
                    <td>
                      <CategoryAction
                        id={item.id}
                        name={item.name}
                        count={item.foodProductCount}
                        parentID={item.id !== 0 ? item.id : undefined}
                        parentName={item.id !== 0 ? item.name : undefined}
                        revalidate={() => fetchCategories()}
                      />
                    </td>
                  </tr>
                  {item.children.map((child) => (
                    <tr className="" key={child.id}>
                      <th>{child.id}</th>
                      <td>{child.name}</td>
                      <td>{child.foodProductCount}</td>
                      <td>
                        <CategoryAction
                          id={child.id}
                          name={child.name}
                          count={item.foodProductCount}
                          parentID={item.id}
                          parentName={item.name}
                          revalidate={() => fetchCategories()}
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>  
              )) || (
                <tr>
                  <td colSpan={5} className="text-center">
                    <span className="loading loading-spinner loading-xl"></span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
