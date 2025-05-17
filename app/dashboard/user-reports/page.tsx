import React from "react";
import { Metadata } from "next";
import { db } from "@/app/db";
import {
  foodCategoryTable,
  foodProductsTable,
  userReportTable,
  usersTable,
} from "@/app/db/schema";
import { count, desc, eq, getTableColumns } from "drizzle-orm";
import Link from "next/link";
import ReportAction from "@/app/components/ReportAction";
import { Pagination } from "@/app/components/Pagination";
import RefreshFoodProduct from "@/app/components/RefreshFoodProduct";

export const metadata: Metadata = {
  title: "User Reports",
};

const ReportOptionsFullNames: Record<string, string> = {
  duplicate_product: "Duplicate Product",
  invalid_name_brand: "Invalid Name or Brand",
  invalid_category: "Invalid Category",
  invalid_nutrition: "Invalid Nutrition Information",
  invalid_image: "Invalid Image",
  other: "Other",
  resubmission: "Resubmission",
};

const ReportStatusIcon: Record<string, string> = {
  pending: "icon-[material-symbols--pending] text-gray-400",
  resolved: "icon-[material-symbols--check-circle] text-primary",
  rejected: "icon-[material-symbols--cancel] text-error",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page } = await searchParams;
  const reportsPerPage = 30;
  
  let currPage = 0;
  if (typeof page === "string" && !isNaN(parseInt(page))) {
    currPage = parseInt(page);
  }

  const totalReportsQuery = await db
    .select({ count: count() })
    .from(userReportTable);
  const totalReports = totalReportsQuery[0].count;
  const totalPages = Math.ceil(totalReports / reportsPerPage);

  const userReports = await db
    .select({
      ...getTableColumns(userReportTable),
      userName: usersTable.name,
      productName: foodProductsTable.name,
      productCategory: foodProductsTable.foodCategoryId,
      productCategoryName: foodCategoryTable.name,
    })
    .from(userReportTable)
    .innerJoin(
      foodProductsTable,
      eq(userReportTable.foodProductId, foodProductsTable.id)
    )
    .innerJoin(
      foodCategoryTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .innerJoin(usersTable, eq(userReportTable.userID, usersTable.id))
    .orderBy(desc(userReportTable.reportTimestamp))
    .limit(reportsPerPage)
    .offset(currPage * reportsPerPage);

  return (
    <div className="mx-4 my-8 lg:m-8">
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[material-symbols--feedback] text-5xl mx-2"></span>
        <div>
          <h1 className="text-2xl font-bold">User Reports</h1>
          <p>View user reports here.</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <div className="flex flex-row justify-center gap-8 items-center mb-4">
          <Pagination
            url="/dashboard/user-reports"
            currPage={currPage}
            totalPages={totalPages}
          />
          <RefreshFoodProduct />
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Date</th>
                <th>Product Name</th>
                <th>Product Category</th>
                <th className="w-xs">Report Type</th>
                <th>Reporter</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {userReports.map((report) => (
                <React.Fragment key={report.reportID}>
                  <tr className="hover:bg-base-300 transition">
                    <td>
                      <b>{report.reportID}</b>
                    </td>
                    <td>{new Date(report.reportTimestamp).toLocaleString()}</td>
                    <td>
                      <Link
                        href={`/dashboard/food-database/${report.foodProductId}`}
                        className="hover:text-primary hover:underline transition font-bold"
                      >
                        {report.productName}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/food-categories/${report.productCategory}`}
                        className="hover:text-primary hover:underline transition"
                      >
                        {report.productCategoryName}
                      </Link>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {report.reportType?.map((type) => (
                          <div
                            key={type}
                            className={`badge badge-soft ${
                              type === "resubmission"
                                ? "badge-secondary"
                                : "badge-primary"
                            }`}
                          >
                            {ReportOptionsFullNames[type]}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>{report.userName}</td>
                    <td>
                      <div className="flex items-center justify-center h-full">
                        <span
                          className={`${
                            ReportStatusIcon[report.reportStatus]
                          } text-3xl`}
                        ></span>
                      </div>
                    </td>
                    <td>
                      <ReportAction
                        reportID={report.reportID}
                        status={report.reportStatus}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td colSpan={3}>
                      <div>
                        {report.oldFoodProductId ? (
                          <p>
                            New product submitted from: ID{" "}
                            <Link
                              href={`/dashboard/food-database/${report.oldFoodProductId}`}
                              className="hover:text-primary hover:underline transition font-bold"
                            >
                              {report.oldFoodProductId}
                            </Link>
                          </p>
                        ) : (
                          <div>
                            <span className="whitespace-pre-wrap">
                              {report.reportDescription || (
                                <i>No description provided.</i>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td colSpan={10}>
                      <div>
                        {report.closeTimestamp && (
                          <p>
                            Ticket{report.reportStatus === "pending" ? " previously " : " "}closed at{" "}
                            <b>{new Date(report.closeTimestamp).toLocaleString()}</b>
                          </p>
                        )}
                        {report.adminComment && (
                          <p>
                            Admin comment:{" "}
                            <span className="whitespace-pre-wrap">
                              {report.adminComment}
                            </span>
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
