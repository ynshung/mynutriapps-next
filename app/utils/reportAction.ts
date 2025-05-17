"use server";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { userReportStatus, userReportTable } from "../db/schema";
import { refreshReports } from "./revalidate";

export const setReportStatus = async (
  reportID: number,
  status: (typeof userReportStatus.enumValues)[number]
) => {
  await db
    .update(userReportTable)
    .set({
      reportStatus: status,
      closeTimestamp: status !== "pending" ? new Date() : undefined,
    })
    .where(eq(userReportTable.reportID, reportID));
  refreshReports();
};

export const setReportComment = async (
  reportID: number,
  comment: string,
) => {
  await db
    .update(userReportTable)
    .set({
      adminComment: comment,
    })
    .where(eq(userReportTable.reportID, reportID));
  refreshReports();
};
