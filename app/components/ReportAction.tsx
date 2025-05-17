"use client";

import React from "react";
import { userReportStatus } from "../db/schema";
import { setReportComment, setReportStatus } from "../utils/reportAction";

export default function ReportAction({
  reportID,
  status,
}: {
  reportID: number;
  status: (typeof userReportStatus.enumValues)[number];
}) {
  return (
    <div className="flex flex-wrap gap-1 justify-center items-center text-center">
      {status === "pending" ? (
        <>
          <button
            className="cursor-pointer"
            title="Resolve"
            onClick={async () => {
              const confirmResolve = confirm(
                "Are you sure you want to resolve this report?"
              );
              if (!confirmResolve) return;
              await setReportStatus(reportID, "resolved");
            }}
          >
            <span className="icon-[material-symbols--check-circle] text-3xl text-primary transition"></span>
          </button>
          <button
            className="cursor-pointer"
            title="Resolve"
            onClick={async () => {
              const confirmReject = confirm(
                "Are you sure you want to reject this report?"
              );
              if (!confirmReject) return;
              await setReportStatus(reportID, "rejected");
            }}
          >
            <span className="icon-[material-symbols--cancel] text-3xl text-error transition"></span>
          </button>
        </>
      ) : (
        <button
          className="cursor-pointer"
          title="Reopen"
          onClick={async () => {
            const confirmReopen = confirm(
              "Are you sure you want to reopen this report?"
            );
            if (!confirmReopen) return;
            await setReportStatus(reportID, "pending");
          }}
        >
          <span className="icon-[material-symbols--rotate-right] text-3xl text-primary transition"></span>
        </button>
      )}
      <button
        className="cursor-pointer"
        title="Comment"
        onClick={async () => {
          const comment = prompt("Enter your comment:");
          if (!comment) return;
          await setReportComment(reportID, comment);
        }}
      >
        <span className="icon-[material-symbols--comment] text-3xl text-gray-800 transition"></span>
      </button>
    </div>
  );
}
