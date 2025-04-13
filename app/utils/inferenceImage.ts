import { User } from "firebase/auth";
import { toast } from "react-toastify";
import {
  CategorySelect,
  FoodIngredientDetails,
  FoodIngredientDetailsServer,
  FoodProduct,
  NutritionInfoSingle,
  NutritionInfoSingleServer,
  StringSelect,
} from "../dashboard/food-database/new-product/types";
import { vitamins } from "../data/vitamins";
import { minerals } from "../data/minerals";
import { allergens } from "../data/allergens";
import React from "react";

export const inferenceImage = async (
  formData: FormData,
  user: User | null,
  setIsInferencing: React.Dispatch<React.SetStateAction<boolean>>,
  setFrontLabelData: React.Dispatch<React.SetStateAction<FoodProduct>>,
  setNutritionInfo: React.Dispatch<React.SetStateAction<NutritionInfoSingle>>,
  setIngredientDetails: React.Dispatch<
    React.SetStateAction<FoodIngredientDetails>
  >,
  categories: CategorySelect[],
  serverUrl: string = "http://localhost:3000",
) => {
  const inferenceFormData = new FormData();
  
  ["front_label", "nutrition_label", "ingredients"].forEach((key) => {
    const image = formData.get(key) as File;
    const imageURL = formData.get(`${key}_url`) as string;
    if (formData.get(`ai_${key}`) === "on" && (image?.size || imageURL)) {
      inferenceFormData.append(key, image);
      inferenceFormData.append(`${key}_url`, imageURL);
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

  const response = await fetch(serverUrl + "/api/v1/admin/product/inference", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: inferenceFormData,
  });
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
            prev?.category || { value: 0, label: "Uncategorized" },
        };
      });
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
                  (allergen): allergen is StringSelect => allergen !== undefined
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
