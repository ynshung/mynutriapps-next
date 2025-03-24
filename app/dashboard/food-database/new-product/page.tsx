"use client";
import { minerals } from "@/app/data/minerals";
import { vitamins } from "@/app/data/vitamins";
import getCategories from "@/app/utils/categorySelect";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import {
  CategorySelect,
  FoodIngredientDetails,
  FoodIngredientDetailsServer,
  FoodProduct,
  FoodProductPreview,
  NutritionInfoSingle,
  NutritionInfoSingleServer,
  StringSelect,
} from "./types";
import { allergens } from "@/app/data/allergens";
import ProductForm from "@/app/components/ProductForm";

export default function Page() {
  const [categories, setCategories] = useState<CategorySelect[]>([]);

  useEffect(() => {
    getCategories().then((data) => setCategories(data));
    return () => setCategories([]);
  }, []);

  const SERVER_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  
  const [barcode, setBarcode] = useState<StringSelect[]>([]);

  const [foodProductPreview, setFoodProductPreview] = useState<FoodProductPreview>({});

  const [frontLabelData, setFrontLabelData] = useState<FoodProduct>(
    {} as FoodProduct
  );
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfoSingle>(
    {} as NutritionInfoSingle
  );
  const [ingredientDetails, setIngredientDetails] =
    useState<FoodIngredientDetails>({} as FoodIngredientDetails);

  const { user } = useUser();
  const [isInferencing, setIsInferencing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement;

    if ((e.nativeEvent as KeyboardEvent).key === "Enter") {
      return;
    }

    if (submitter.value === "inference") {
      handleSubmitImages(formData);
    } else if (submitter.value === "submit") {
      handleSubmitProduct(formData);
    }
  };

  const handleSubmitImages = async (formData: FormData) => {
    const inferenceFormData = new FormData();

    ["front_label", "nutrition_label", "ingredients"].forEach((key) => {
      const image = formData.get(key) as File;
      if (formData.get(`ai_${key}`) === "on" && image?.size) {
        inferenceFormData.append(key, image);
      }
    });

    if (!inferenceFormData.keys().next().value) {
      toast("No images selected for inferencing", { type: "info" });
      return;
    }

    const idToken = await user?.getIdToken();
    if (!idToken) {
      toast("Error getting user token", { type: "error" });
      return;
    }

    setIsInferencing(true);

    const response = await fetch(
      SERVER_URL + "/api/v1/admin/product/inference",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: inferenceFormData,
      }
    );
    const {
      data,
      status,
      message,
    }: {
      status: string;
      message: string;
      data: {
        frontLabelData?: FoodProduct;
        nutritionLabelData?: NutritionInfoSingleServer;
        ingredientsLabelData?: FoodIngredientDetailsServer;
      };
    } = await response.json();
    if (response.ok && status === "success") {
      if (data.frontLabelData) {
        if (data.frontLabelData) {
          setFrontLabelData((prev) => {
            if (!data.frontLabelData) return prev;
            return {
              ...prev,
              ...data.frontLabelData,
              name: data.frontLabelData.name || prev?.name || "",
              brand: data.frontLabelData.brand || prev?.brand || "",
              category: categories.find(
                (cat) =>
                  data.frontLabelData?.category &&
                  cat.label === data.frontLabelData.category
              ) ||
                prev?.category || { value: 0, label: "" },
            };
          });
        }
      }
      if (data.nutritionLabelData) {
        if (!data.nutritionLabelData.extractableTable) {
          toast("Nutrition table not extractable", { type: "warning" });
        }
        const updatedNutritionInfo: NutritionInfoSingle = {
          ...data.nutritionLabelData,
          servingSizeUnit: {
            value: data.nutritionLabelData?.servingSizeUnit || "",
            label: data.nutritionLabelData?.servingSizeUnit || "",
          },
          vitamins:
            (data.nutritionLabelData.vitamins &&
              data.nutritionLabelData.vitamins
                .map((vitamin) => vitamins.find((vit) => vit.value === vitamin))
                .filter(
                  (vitamin): vitamin is StringSelect => vitamin !== undefined
                )) ||
            [],
          minerals:
            (data.nutritionLabelData.minerals &&
              data.nutritionLabelData.minerals
                .map((mineral) => minerals.find((min) => min.value === mineral))
                .filter(
                  (mineral): mineral is StringSelect => mineral !== undefined
                )) ||
            [],
          uncategorized:
            data.nutritionLabelData.uncategorized &&
            data.nutritionLabelData.uncategorized.map((uncategorized) => {
              return {
                value: uncategorized,
                label: uncategorized,
              };
            }),
        };
        setNutritionInfo(updatedNutritionInfo);
      }
      if (data.ingredientsLabelData) {
        setIngredientDetails((prev) => {
          if (!data.ingredientsLabelData) return prev;
          return {
            ...prev,
            ...data.ingredientsLabelData,
            additives:
              (data.ingredientsLabelData.additives &&
                data.ingredientsLabelData.additives.map((additive) => {
                  return {
                    value: additive,
                    label: additive,
                  };
                })) ||
              [],
            allergens:
              (data.ingredientsLabelData.allergens &&
                data.ingredientsLabelData.allergens
                  .map((allergen) =>
                    allergens.find((all) => all.value === allergen)
                  )
                  .filter(
                    (allergen): allergen is StringSelect =>
                      allergen !== undefined
                  )) ||
              [],
          };
        });
      }
    } else {
      toast(message || "Error submitting images", { type: "error" });
    }
    setIsInferencing(false);
  };

  const handleSubmitProduct = async (formData: FormData) => {
    setIsSubmitting(true);
    console.log("Submitting product...");
    const response = await fetch(SERVER_URL + "/api/v1/admin/product/submit", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${await user?.getIdToken()}`,
      },
    });
    if (response.ok) {
      toast("Product submitted successfully", { type: "success" });
    } else {
      const errorMessage = await response.text();
      toast(`Error submitting product: ${errorMessage}`, { type: "error" });
    }
    setIsSubmitting(false);
  };

  return (
    <main className="m-8">
      <ToastContainer />
      <h1 className="text-2xl font-bold">New Product</h1>
      <p>Add a new product to the food database.</p>

      <ProductForm
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
      />
    </main>
  );
}
