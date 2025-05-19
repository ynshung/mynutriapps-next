import React from "react";
import { Metadata } from "next";
import {
  foodProductsTable,
  nutritionInfoTable,
  userProductClicksTable,
  userReportTable,
  usersTable,
} from "../db/schema";
import { and, count, desc, eq, ne, notInArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  BarChartGropued,
  PieChartUserGoals,
} from "../components/DashboardComponent";
import Link from "next/link";
import { ReportOptionsFullNames } from "../data/reports";
import RefreshDashboard from "../components/RefreshDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const NumberIndicatorCard = ({
  icon,
  title,
  value,
  subtext,
}: {
  icon: string;
  title: string;
  value: string;
  subtext?: string;
}) => {
  return (
    <div className="flex flex-col gap-3 items-start p-6 rounded-xl border-2 bg-white border-gray-200">
      <div className="flex justify-center items-center bg-primary-light p-3 rounded-xl mb-4 hover:scale-105 transition">
        <span className={`text-3xl ${icon} text-gray-800`}></span>
      </div>
      <p className="text-sm font-semibold font-montserrat text-gray-400">
        {title}
      </p>
      <div className="flex flex-row flex-wrap items-baseline gap-2">
        <p className="text-4xl font-bold font-montserrat">{value}</p>
        {subtext && (
          <p className="font-montserrat text-gray-600">({subtext})</p>
        )}
      </div>
    </div>
  );
};

export default async function Dashboard() {
  const dateSqlClicks = sql`TO_CHAR(${userProductClicksTable.clickedAt}, 'YYYY-MM-DD')`;
  const dateSqlProducts = sql`TO_CHAR(${foodProductsTable.createdAt}, 'YYYY-MM-DD')`;

  const fetchDashboardData = async () => {
    const [
      totalProducts,
      totalClicks,
      totalProductScan,
      totalNutrition,
      totalUsers,
      totalVerifiedProducts,
      pendingReports,
      productClickGroup,
      userSelectedGoal,
      totalProductAddedGroup,
      recentReports,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(foodProductsTable)
        .where(eq(foodProductsTable.hidden, false)),
      db
        .select({ count: count() })
        .from(userProductClicksTable)
        .where(ne(userProductClicksTable.userID, 23)),
      db
        .select({ count: count() })
        .from(userProductClicksTable)
        .where(
          and(
            eq(userProductClicksTable.userScan, true),
            ne(userProductClicksTable.userID, 23)
          )
        ),
      db
        .select({ count: count() })
        .from(nutritionInfoTable)
        .innerJoin(
          foodProductsTable,
          eq(nutritionInfoTable.foodProductId, foodProductsTable.id)
        ),
      db.select({ count: count() }).from(usersTable),
      db
        .select({ count: count() })
        .from(foodProductsTable)
        .where(eq(foodProductsTable.verified, true)),
      db
        .select({ count: count() })
        .from(userReportTable)
        .where(eq(userReportTable.reportStatus, "pending")),
      db
        .select({
          date: dateSqlClicks.mapWith(String),
          count: count(),
        })
        .from(userProductClicksTable)
        .where(ne(userProductClicksTable.userID, 23))
        .groupBy(dateSqlClicks)
        .orderBy(dateSqlClicks),
      db
        .select({
          goal: usersTable.goal,
          count: count(),
        })
        .from(usersTable)
        .where(notInArray(usersTable.id, [-1, 23]))
        .groupBy(usersTable.goal),
      db
        .select({
          date: dateSqlProducts.mapWith(String),
          count: count(),
        })
        .from(foodProductsTable)
        .groupBy(dateSqlProducts)
        .orderBy(dateSqlProducts),
      db
        .select({
          id: userReportTable.reportID,
          title: userReportTable.foodProductId,
          type: userReportTable.reportType,
          description: userReportTable.reportDescription,
        })
        .from(userReportTable)
        .orderBy(desc(userReportTable.reportTimestamp))
        .limit(5),
    ]);

    return {
      totalProducts: totalProducts[0].count,
      totalClicks: totalClicks[0].count,
      totalProductScan: totalProductScan[0].count,
      totalNutrition: totalNutrition[0].count,
      totalUsers: totalUsers[0].count,
      totalVerifiedProducts: totalVerifiedProducts[0].count,
      pendingReports: pendingReports[0].count,
      productClickGroup: productClickGroup,
      userSelectedGoal: userSelectedGoal,
      totalProductAddedGroup: totalProductAddedGroup,
      recentReports: recentReports,
    };
  };

  const {
    totalProducts,
    totalClicks,
    totalProductScan,
    totalNutrition,
    totalUsers,
    totalVerifiedProducts,
    pendingReports,
    productClickGroup,
    userSelectedGoal,
    totalProductAddedGroup,
    recentReports,
  } = await fetchDashboardData();

  const cardsData = [
    {
      icon: "icon-[material-symbols--grocery]",
      title: "Total Products",
      value: totalProducts.toLocaleString(),
    },
    {
      icon: "icon-[material-symbols--nutrition]",
      title: "Product with Nutrition Info",
      value: totalNutrition.toLocaleString(),
      subtext: `${((totalNutrition / totalProducts) * 100).toFixed(2)}%`,
    },
    {
      icon: "icon-[material-symbols--verified]",
      title: "Verified Products",
      value: totalVerifiedProducts.toLocaleString(),
      subtext: `${((totalVerifiedProducts / totalProducts) * 100).toFixed(2)}%`,
    },
    {
      icon: "icon-[material-symbols--ads-click]",
      title: "Product Views",
      value: totalClicks.toLocaleString(),
    },
    {
      icon: "icon-[material-symbols--qr-code-scanner]",
      title: "Product Scans",
      value: totalProductScan.toLocaleString(),
    },

    {
      icon: "icon-[material-symbols--person]",
      title: "Total Users",
      value: (totalUsers - 2).toLocaleString(), // Admin and anonymous user
    },
    {
      icon: "icon-[material-symbols--feedback]",
      title: "Pending Reports",
      value: pendingReports.toLocaleString(),
    },
  ];

  return (
    <main className="mx-4 my-8 lg:m-8">
      <div className="flex flex-row gap-2 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>MyNutriApps&#39;s info at a glance.</p>
        </div>
        <RefreshDashboard />
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6 mt-8">
          {cardsData.map((card, index) => (
            <NumberIndicatorCard
              key={index}
              icon={card.icon}
              title={card.title}
              value={card.value}
              subtext={card.subtext}
            />
          ))}
        </div>

        <div className="flex flex-row flex-wrap gap-8 my-8 justify-evenly items-center">
          <div className="flex-1 max-w-2xl">
            <BarChartGropued
              titleText="Total Clicks Per Day"
              labelText="Clicks"
              groupedData={productClickGroup}
            />
          </div>
          <div className="flex-1 max-w-2xl">
            <BarChartGropued
              titleText="Total Products Added Per Day"
              labelText="Products Added"
              groupedData={totalProductAddedGroup}
            />
          </div>
          <div className="flex-1 max-w-md">
            <PieChartUserGoals
              userSelectedGoal={userSelectedGoal
                .filter((item) => item.goal !== null)
                .map((item) => ({ ...item, goal: item.goal as string }))}
            />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold font-montserrat">
              Recent Reports
              <Link href="/dashboard/user-reports">
                <span className="icon-[mdi--external-link] text-md text-gray-600 ml-2"></span>
              </Link>
            </p>
            <div className="mt-4">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Product ID</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.id}</td>
                      <td>{report.title}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {report.type?.map((type) => (
                            <div
                              key={type}
                              className={`badge badge-sm badge-soft ${
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
                      <td className="text-xs overflow-ellipsis">
                        {report.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
