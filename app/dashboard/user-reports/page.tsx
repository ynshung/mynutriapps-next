import React from "react";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'User Report',
};

export default function page() {
  return (
    <div className="mx-4 my-8 lg:m-8">
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[material-symbols--feedback] text-5xl mx-2"></span>
        <div>
          <h1 className="text-2xl font-bold">User Reports</h1>
          <p>View user reports here.</p>
        </div>
      </div>
    </div>
  );
}
