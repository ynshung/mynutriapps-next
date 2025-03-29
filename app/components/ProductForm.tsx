"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { getCategories } from "../utils/categorySelect";
import {
  CategorySelect,
  FoodIngredientDetails,
  FoodProduct,
  FoodProductPreview,
  NutritionInfoSingle,
  StringSelect,
} from "../dashboard/food-database/new-product/types";
import Image from "next/image";
import { updateState } from "../utils/updateState";
import { vitamins } from "../data/vitamins";
import { minerals } from "../data/minerals";
import { allergens } from "../data/allergens";
import ProductImageComponent from "./ProductImageComponent";
import NumberInput from "./NumberInput";
import { useUser } from "../context/UserContext";
import { inferenceImage } from "../utils/inferenceImage";
import { toast, ToastContainer } from "react-toastify";
import { getProduct } from "../utils/getProduct";
import { dbToForm } from "../utils/dbToForm";

const Select = dynamic(() => import("react-select"), { ssr: false });
const CreatableSelect = dynamic(() => import("react-select/creatable"), {
  ssr: false,
});

interface ProductFormProps {
  initialProduct?: number;
  editingProduct?: number;
}

export default function ProductForm({
  initialProduct,
  editingProduct,
}: ProductFormProps) {
  if (editingProduct) {
    initialProduct = editingProduct;
  } 

  const [barcode, setBarcode] = useState<StringSelect[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  const [foodProductPreview, setFoodProductPreview] =
    useState<FoodProductPreview>({});

  const [frontLabelData, setFrontLabelData] = useState<FoodProduct>(
    {} as FoodProduct
  );
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfoSingle>(
    {} as NutritionInfoSingle
  );
  const [ingredientDetails, setIngredientDetails] =
    useState<FoodIngredientDetails>({} as FoodIngredientDetails);

  const SERVER_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

  const { user } = useUser();
  const [categories, setCategories] = useState<CategorySelect[]>([]);
  const [isInferencing, setIsInferencing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then((data) => setCategories(data));
    return () => setCategories([]);
  }, []);

  useEffect(() => {
    if (initialProduct) {
      getProduct(initialProduct).then((data) => {
        if (!data) {
          toast("Error fetching product", { type: "error" });
          return;
        }
        const formData = dbToForm(data);
        setBarcode(formData.foodProductOther.barcode);
        setIsVerified(formData.foodProductOther.verified);
        setFrontLabelData(formData.frontLabel);
        setNutritionInfo(formData.nutritionInfo ?? {});
        setIngredientDetails(formData.ingredientDetails);
        setFoodProductPreview(formData.foodProductPreview);
      });
    }
  }, [initialProduct]);

  const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);
  const imageModal = useRef<HTMLDialogElement>(null);

  const onImageView = (src: string) => {
    setImageModalSrc(src);
    imageModal.current?.showModal();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement;

    if ((e.nativeEvent as KeyboardEvent).key === "Enter") {
      return;
    }

    if (submitter.value === "inference") {
      inferenceImage(
        formData,
        user,
        setIsInferencing,
        setFrontLabelData,
        setNutritionInfo,
        setIngredientDetails,
        categories,
        SERVER_URL
      );
    } else if (submitter.value === "submit") {
      handleSubmitProduct(formData);
    }
  };

  const handleSubmitProduct = async (formData: FormData) => {
    setIsSubmitting(true);
    if (editingProduct === undefined) {
      const response = await fetch(
        SERVER_URL + "/api/v1/admin/product/submit",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );
      if (response.ok) {
        toast("Product submitted successfully", { type: "success" });
      } else {
        const errorMessage = await response.text();
        toast(`Error submitting product: ${errorMessage}`, { type: "error" });
      }
    } else {
      const response = await fetch(
        SERVER_URL + `/api/v1/admin/product/edit/${editingProduct}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );
      if (response.ok) {
        toast("Product edited successfully", { type: "success" });
      } else {
        const errorMessage = await response.text();
        toast(`Error submitting product: ${errorMessage}`, { type: "error" });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 w-full flex-wrap lg:flex-nowrap"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        <div className="mt-4 p-4 bg-base-100 rounded shadow flex flex-col gap-2">
          <div className="flex flex-row gap-4 items-center justify-evenly mx-2 mt-2">
            <h2 className="font-bold items-center flex gap-2 text-lg">
              <span className="icon-[material-symbols--verified] text-primary text-2xl"></span>
              Verified
            </h2>
            <input
              name="verified"
              type="checkbox"
              className="toggle toggle-primary toggle-md"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
            />
          </div>
          <div className="divider my-0" />
          <h2 className="text-lg font-bold">Product Image</h2>
          <ProductImageComponent
            imageName="Front Label"
            imageKey="front_label"
            onImageView={onImageView}
            imageFile={foodProductPreview}
            setImageFile={setFoodProductPreview}
          />
          <ProductImageComponent
            imageName="Nutrition Table"
            imageKey="nutrition_label"
            onImageView={onImageView}
            imageFile={foodProductPreview}
            setImageFile={setFoodProductPreview}
          />
          <ProductImageComponent
            imageName="Ingredients"
            imageKey="ingredients"
            onImageView={onImageView}
            imageFile={foodProductPreview}
            setImageFile={setFoodProductPreview}
          />
          <button
            name="action"
            value="inference"
            type="submit"
            className="btn btn-primary font-montserrat"
            disabled={isInferencing}
          >
            {isInferencing ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <span className="icon-[material-symbols--rocket-launch] text-xl"></span>
            )}
            AI Inference
          </button>
        </div>
        <div className="mt-4 p-4 bg-base-100 rounded shadow grow flex flex-col max-w-4/5">
          <h2 className="text-lg font-bold mb-2">General Info</h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 items-center flex-wrap">
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-20">Name</p>
              <input
                name="name"
                type="text"
                className="input"
                value={frontLabelData?.name ?? ""}
                onInput={(e) =>
                  updateState(setFrontLabelData, "name", e.currentTarget.value)
                }
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-20">Brand</p>
              <input
                name="brand"
                type="text"
                className="input"
                value={frontLabelData?.brand ?? ""}
                onInput={(e) =>
                  updateState(setFrontLabelData, "brand", e.currentTarget.value)
                }
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-20">Barcode</p>
              <CreatableSelect
                name="barcode"
                isMulti
                options={[]}
                placeholder="Write to add..."
                className="w-xs text-sm"
                value={barcode ?? []}
                onChange={(selection) => {
                  setBarcode(selection as StringSelect[]);
                }}
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-20">Category</p>
              <Select
                name="category"
                placeholder="Search..."
                value={frontLabelData?.category ?? { value: 0, label: "" }}
                onChange={(selection) => {
                  updateState(
                    setFrontLabelData,
                    "category",
                    selection as CategorySelect
                  );
                }}
                options={categories}
                className="w-xs text-sm"
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-20">
                Serving
                <br />
                Size
              </p>
              <div className="flex flex-row gap-2 items-center">
                <input
                  name="servingSize"
                  type="number"
                  min="0"
                  step="any"
                  className="input w-24"
                  value={nutritionInfo?.servingSize || ""}
                  onInput={(e) =>
                    updateState(
                      setNutritionInfo,
                      "servingSize",
                      parseFloat(e.currentTarget.value)
                    )
                  }
                />
                <Select
                  name="servingSizeUnit"
                  options={[
                    { value: "g", label: "g" },
                    { value: "ml", label: "ml" },
                  ]}
                  placeholder="unit"
                  value={
                    nutritionInfo?.servingSizeUnit ?? { value: "", label: "" }
                  }
                  onChange={(selection) => {
                    updateState(
                      setNutritionInfo,
                      "servingSizeUnit",
                      selection as StringSelect
                    );
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-20">Number of servings</p>
              <div className="flex flex-row gap-2 items-center">
                <input
                  name="servingSizePerUnit"
                  type="number"
                  min="0"
                  step="any"
                  className="input w-24"
                  value={nutritionInfo?.servingSizePerUnit ?? ""}
                  onInput={(e) =>
                    updateState(
                      setNutritionInfo,
                      "servingSizePerUnit",
                      parseFloat(e.currentTarget.value)
                    )
                  }
                />
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-2 mt-8">
            Nutritional Info (per 100g/ml)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-center flex-wrap">
            <NumberInput
              inputTitle="Calories"
              inputKey="calories"
              inputValue={nutritionInfo?.calories}
              setInputValue={setNutritionInfo}
              inputUnit="kcal"
            />
            <NumberInput
              inputTitle="Protein"
              inputKey="protein"
              inputValue={nutritionInfo?.protein}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Carbs"
              inputKey="carbs"
              inputValue={nutritionInfo?.carbs}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Sugar"
              inputKey="sugar"
              inputValue={nutritionInfo?.sugar}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Fiber"
              inputKey="fiber"
              inputValue={nutritionInfo?.fiber}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Cholesterol"
              inputKey="cholesterol"
              inputValue={nutritionInfo?.cholesterol}
              setInputValue={setNutritionInfo}
              inputUnit="mg"
            />
            <NumberInput
              inputTitle="Sodium"
              inputKey="sodium"
              inputValue={nutritionInfo?.sodium}
              setInputValue={setNutritionInfo}
              inputUnit="mg"
            />
          </div>

          <h2 className="text-md font-semibold mt-4 my-2">Fats</h2>

          <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 items-center flex-wrap">
            <NumberInput
              inputTitle="Total Fats"
              inputKey="fat"
              inputValue={nutritionInfo?.fat}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Monounsaturated"
              inputKey="monounsaturatedFat"
              inputValue={nutritionInfo?.monounsaturatedFat}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Polyunsaturated"
              inputKey="polyunsaturatedFat"
              inputValue={nutritionInfo?.polyunsaturatedFat}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Saturated Fat"
              inputKey="saturatedFat"
              inputValue={nutritionInfo?.saturatedFat}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
            <NumberInput
              inputTitle="Trans Fat"
              inputKey="transFat"
              inputValue={nutritionInfo?.transFat}
              setInputValue={setNutritionInfo}
              inputUnit="g"
            />
          </div>

          <h2 className="text-md font-semibold mt-4 my-2">Other</h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-4 items-center flex-wrap">
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-26">Vitamins</p>
              <Select
                name="vitamins"
                isMulti
                options={vitamins}
                value={nutritionInfo?.vitamins}
                onChange={(selection) => {
                  updateState(
                    setNutritionInfo,
                    "vitamins",
                    selection as StringSelect[]
                  );
                }}
                className="w-xs text-sm"
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-26">Minerals</p>
              <Select
                name="minerals"
                isMulti
                options={minerals}
                value={nutritionInfo?.minerals}
                onChange={(selection) => {
                  updateState(
                    setNutritionInfo,
                    "minerals",
                    selection as StringSelect[]
                  );
                }}
                className="w-xs text-sm"
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-right w-26">Uncategorized</p>
              <CreatableSelect
                name="uncategorized"
                isMulti
                options={[]}
                placeholder="Write to add..."
                value={nutritionInfo?.uncategorized}
                onChange={(selection) => {
                  updateState(
                    setNutritionInfo,
                    "uncategorized",
                    selection as StringSelect[]
                  );
                }}
                className="w-xs text-sm"
              />
            </div>
          </div>

          <h2 className="text-lg font-bold mb-2 mt-8">Ingredients</h2>
          <div className="flex flex-col gap-4 flex-wrap">
            <textarea
              name="ingredients"
              className="textarea w-full"
              value={ingredientDetails?.ingredients}
              onInput={(e) =>
                updateState(
                  setIngredientDetails,
                  "ingredients",
                  e.currentTarget.value
                )
              }
              placeholder="Full ingredients list..."
            ></textarea>
            <div className="flex flex-col gap-2">
              <p className="text-sm">Allergens</p>
              <CreatableSelect
                name="allergens"
                isMulti
                options={allergens}
                value={ingredientDetails?.allergens}
                onChange={(selection) => {
                  updateState(
                    setIngredientDetails,
                    "allergens",
                    selection as StringSelect[]
                  );
                }}
                className="w-full"
                menuPlacement="auto"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm">Additives</p>
              <CreatableSelect
                name="additives"
                isMulti
                options={[]}
                placeholder="Write to add..."
                value={ingredientDetails?.additives}
                onChange={(selection) => {
                  updateState(
                    setIngredientDetails,
                    "additives",
                    selection as StringSelect[]
                  );
                }}
                className="w-full"
                menuPlacement="auto"
              />
            </div>
          </div>

          <div className="mx-auto mt-4">
            <button
              name="action"
              className="btn btn-primary font-montserrat"
              type="submit"
              value="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : editingProduct ? (
                <span className="icon-[material-symbols--edit] text-xl"></span>
              ) : (
                <span className="icon-[material-symbols--send] text-xl"></span>
              )}
              {editingProduct ? "Edit" : "Create"}
            </button>
          </div>
        </div>
      </form>

      <dialog ref={imageModal} className="modal">
        <div className="modal-box w-11/12 max-w-5xl h-3/4">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {imageModalSrc && (
            <div className="relative w-full h-full">
              <Image
                src={imageModalSrc}
                alt="Modal image"
                fill
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
