import React from "react";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function Dashboard() {
  return (
    <main className="mx-4 my-8 lg:m-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    </main>
  );
}
