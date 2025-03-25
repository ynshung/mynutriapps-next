import Image from "next/image";
import React, { useRef } from "react";
import { FoodProductPreview } from "../dashboard/food-database/new-product/types";
import { updateState } from "../utils/updateState";

interface ProductImageComponentProps {
  imageName: string;
  imageKey: keyof FoodProductPreview;
  imageFile: FoodProductPreview;
  setImageFile: React.Dispatch<React.SetStateAction<FoodProductPreview>>;
  onImageView: (image: string) => void;
}

export default function ProductImageComponent({
  imageName,
  imageKey,
  imageFile,
  setImageFile,
  onImageView,
}: ProductImageComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend w-full">
        {imageName}
        <p className="flex items-center gap-2">
          AI
          <input
            type="checkbox"
            className="toggle toggle-xs toggle-primary"
            name={`ai_${imageKey}`}
          />
        </p>
      </legend>
      {imageFile && imageFile[imageKey] && (
        <div className="relative w-full h-48">
          <input name={`${imageKey}_url`} value={imageFile[imageKey] as string} type="hidden"></input>
          <Image
            src={imageFile[imageKey] as string}
            alt={imageName}
            fill
            className="object-cover cursor-zoom-in rounded-sm"
            onClick={() => onImageView(imageFile[imageKey] as string)}
          />
          <button
            className="btn btn-xs btn-circle btn-error absolute right-2 top-2 text-white"
            onClick={() => {
              updateState(setImageFile, imageKey, undefined);
              inputRef.current!.value = "";
            }}
          >
            ✕
          </button>
        </div>
      )}
      <input
        type="file"
        name={imageKey}
        className="file-input"
        accept=".jpg, .jpeg, .png"
        capture="user"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            updateState(setImageFile, imageKey as keyof FoodProductPreview, URL.createObjectURL(e.target.files[0]));
          }
        }}
      />
    </fieldset>
  );
}
