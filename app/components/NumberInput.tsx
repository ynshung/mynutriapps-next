import React from "react";
import { updateState } from "../utils/updateState";

interface NumberInputProps<T> {
  inputTitle: string;
  inputKey: string;
  inputValue?: number;
  setInputValue: React.Dispatch<React.SetStateAction<T>>;
  inputUnit: string;
}

export default function NumberInput<T>({
  inputTitle,
  inputKey,
  inputValue,
  setInputValue,
  inputUnit,
}: NumberInputProps<T>) {
  return (
    <div className="flex flex-row gap-4 items-center">
      <p className="text-sm text-right w-32">{inputTitle}</p>
      <div className="flex flex-row gap-2 items-center">
        <input
          name={inputKey}
          type="number"
          min="0"
          step="any"
          className="input w-24"
          value={inputValue ?? ""}
          onInput={(e) => {
            updateState(
              setInputValue,
              inputKey as keyof T,
              parseFloat(e.currentTarget.value) as T[keyof T]
            );
          }}
        />
        <p className="text-sm w-4">{inputUnit}</p>
      </div>
    </div>
  );
}
