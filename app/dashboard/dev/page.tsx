"use client";
import ProductForm from "@/app/components/ProductForm";
import React from "react";

export default function Dev() {
  return (
    <main>
      <h1>Welcome to the Dev Page</h1>
      <p>Your dev page is ready for your activities.</p>
      <div>
        <ProductForm initialProduct={2} editingProduct={2} />
      </div>
    </main>
  );
}
