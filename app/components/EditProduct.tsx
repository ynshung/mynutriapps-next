"use client";
import React, { useEffect } from "react";
import { getProduct } from "../utils/getProduct";

export default function EditProduct({ product }: { product: number }) {
  useEffect(() => {
    getProduct(product).then((data) => {
      console.log(data);
    });
  }, [product]);

  return (
    <div>
      {/* <ProductForm
        handleSubmit={handleSubmit}
        barcode={barcode}
        setBarcode={setBarcode}
        foodProductPreview={foodProductPreview}
        frontLabelData={frontLabelData}
        nutritionInfo={nutritionInfo}
        ingredientDetails={ingredientDetails}
        setFoodProductPreview={setFoodProductPreview}
        setFrontLabelData={setFrontLabelData}
        setNutritionInfo={setNutritionInfo}
        setIngredientDetails={setIngredientDetails}
        isInferencing={isInferencing}
        isSubmitting={isSubmitting}
      /> */}
    </div>
  );
}
