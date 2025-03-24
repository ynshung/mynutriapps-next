import {
  FoodIngredientDetails,
  FoodProduct,
  FoodProductPreview,
  NutritionInfoSingle,
  StringSelect,
} from "../dashboard/food-database/new-product/types";
import { allergens } from "../data/allergens";
import { minerals } from "../data/minerals";
import { vitamins } from "../data/vitamins";
import { ServerFoodProductDetails } from "../db/types";

interface dbToFormProps {
  foodProductOther: {
    barcode: StringSelect[];
    verified: boolean;
  };
  foodProductPreview: FoodProductPreview;
  frontLabel: FoodProduct;
  nutritionInfo: NutritionInfoSingle;
  ingredientDetails: FoodIngredientDetails;
}

const toFloatOrUndefined = (value: string | null) => {
  return value !== null ? parseFloat(value) : undefined;
};

export const dbToForm = (data: ServerFoodProductDetails): dbToFormProps => {
  const getImageUrl = (type: string) =>
    data.images.find((img) => img.type === type)
      ? `${process.env.NEXT_PUBLIC_S3_URL}/${data.images.find((img) => img.type === type)?.imageKey}`
      : undefined;

  const frontLabelImage = getImageUrl("front");
  const nutritionLabelImage = getImageUrl("nutritional_table");
  const ingredientsImage = getImageUrl("ingredients");
  
  return {
    foodProductOther: {
      barcode: data.food_products.barcode?.map((code) => ({
        label: code,
        value: code,
      })) || [],
      verified: data.food_products.verified === true,
    },
    foodProductPreview: {
      front_label: frontLabelImage,
      nutrition_label: nutritionLabelImage,
      ingredients: ingredientsImage,
    },
    frontLabel: {
      name: data.food_products.name!,
      brand: data.food_products.brand!,
      category: {
        label: data.food_category.name,
        value: data.food_category.id,
      },
    },
    nutritionInfo: {
      servingSize: parseFloat(data.nutrition_info.servingSize!),
      servingSizeUnit: {
        label: data.nutrition_info.servingSizeUnit!,
        value: data.nutrition_info.servingSizeUnit!,
      },
      servingSizePerUnit: toFloatOrUndefined(
        data.nutrition_info.servingSizePerUnit
      ),
      calories: toFloatOrUndefined(data.nutrition_info.calories),
      fat: toFloatOrUndefined(data.nutrition_info.fat),
      carbs: toFloatOrUndefined(data.nutrition_info.carbs),
      protein: toFloatOrUndefined(data.nutrition_info.protein),
      sugar: toFloatOrUndefined(data.nutrition_info.sugar),
      monounsaturatedFat: toFloatOrUndefined(
        data.nutrition_info.monounsaturatedFat
      ),
      polyunsaturatedFat: toFloatOrUndefined(
        data.nutrition_info.polyunsaturatedFat
      ),
      saturatedFat: toFloatOrUndefined(data.nutrition_info.saturatedFat),
      transFat: toFloatOrUndefined(data.nutrition_info.transFat),
      fiber: toFloatOrUndefined(data.nutrition_info.fiber),
      sodium: toFloatOrUndefined(data.nutrition_info.sodium),
      cholesterol: toFloatOrUndefined(data.nutrition_info.cholesterol),
      vitamins: data.nutrition_info.vitamins
        ?.map((vitamin) => vitamins.find((vit) => vit.value === vitamin))
        .filter((vitamin): vitamin is StringSelect => vitamin !== undefined),
      minerals: data.nutrition_info.minerals
        ?.map((mineral) => minerals.find((min) => min.value === mineral))
        .filter((mineral): mineral is StringSelect => mineral !== undefined),
      uncategorized: data.nutrition_info.uncategorized?.map(
        (uncategorized) => ({
          label: uncategorized,
          value: uncategorized,
        })
      ),
    },
    ingredientDetails: {
      ingredients: data.food_products.ingredients || "",
      additives:
        data.food_products.additives?.map((additive) => ({
          label: additive,
          value: additive,
        })) || [],
      allergens: (data.food_products.allergens || [])
        .map((allergen) => allergens.find((all) => all.value === allergen))
        .filter((allergen): allergen is StringSelect => allergen !== undefined),
    },
  };
};
