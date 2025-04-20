import Link from 'next/link';
import React from 'react'
import JumpPage from './JumpPage';

export const Pagination = ({
  url,
  currPage,
  totalPages,
  queries,
}: {
  url: string;
  currPage: number;
  totalPages: number;
  queries?: string;
}) => (
  <div className="flex justify-center">
    <div className="join">
      {currPage !== 0 && (
        <Link
          href={`${url}?page=${currPage - 1}${queries ? `&${queries}` : ""}`}
          className="join-item btn"
        >
          «
        </Link>
      )}
      <JumpPage currPage={currPage} total={totalPages} />
      {totalPages > currPage + 1 && (
        <Link
          href={`${url}?page=${currPage + 1}${queries ? `&${queries}` : ""}`}
          className="join-item btn"
        >
          »
        </Link>
      )}
    </div>
  </div>
);
