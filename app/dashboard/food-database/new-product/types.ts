export interface FoodProductPreview {
  front_label?: string;
  nutrition_label?: string;
  ingredients?: string;
}

export interface FoodProduct {
  name: string;
  brand: string;
  category: CategorySelect | string;
}

export interface CategorySelect {
  value: number;
  label: string;
}

export interface StringSelect {
  value: string;
  label: string;
}

// TODO: the interface for frontend and backend seems to be different, might need to implement some kind of mapping

interface NutritionInfo {
  extractableTable?: boolean;

  servingSize?: number;
  servingSizeUnit?: string | StringSelect;
  servingSizePerUnit?: number;

  calories?: number;
  fat?: number;
  carbs?: number;
  protein?: number;
  sugar?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  saturatedFat?: number;
  transFat?: number;
  fiber?: number;
  sodium?: number;
  cholesterol?: number;

  vitamins?: string[] | StringSelect[];
  minerals?: string[] | StringSelect[];
  uncategorized?: string[] | StringSelect[];
}

export interface NutritionInfoSingle extends NutritionInfo {
  servingSizeUnit?: StringSelect;
  vitamins?: StringSelect[];
  minerals?: StringSelect[];
  uncategorized?: StringSelect[];
}

export interface NutritionInfoSingleServer extends NutritionInfo {
  servingSizeUnit?: string;
  vitamins?: string[];
  minerals?: string[];
  uncategorized?: string[];
}

export interface FoodIngredientDetails {
  ingredients: string;
  additives: StringSelect[];
  allergens: StringSelect[];
}

export interface FoodIngredientDetailsServer {
  ingredients: string;
  additives: string[];
  allergens: string[];
}
