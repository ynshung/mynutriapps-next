"use client";

import { useRouter } from "next/navigation";
import { useModal } from "../context/ModalContext";
import { useRef } from "react";

export default function JumpPage({ currPage }: { currPage: number }) {
  const router = useRouter();
  const { showModal, hideModal } = useModal();

  const inputText = useRef<HTMLInputElement>(null);

  const handleOnClick = () => {
    showModal(
      <div className="flex flex-col gap-4 items-center justify-center">
        <h2 className="text-lg">Jump to Page</h2>
        <div className="flex flex-row gap-2 items-center justify-center">
          <input
            type="number"
            placeholder="Enter page number"
            className="input input-bordered w-32"
            ref={inputText}
            defaultValue={currPage + 1}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              const inputValue = inputText.current?.value;
              const pageNumber = parseInt(inputValue || "");
              if (!isNaN(pageNumber) && pageNumber > 0) {
                handleJumpPage(pageNumber);
              }
            }}
          >
            Go
          </button>
        </div>
      </div>
    , false);
  };

  const handleJumpPage = (page: number) => {
    const pageNum = page - 1;
    if (pageNum >= 0) {
      router.push(`/dashboard/food-database?page=${pageNum}`);
    } else {
      alert("Invalid page number");
    }
    hideModal();
  };

  return (
    <button className="join-item btn" onClick={() => handleOnClick()}>
      Page {currPage + 1}
    </button>
  );
}
