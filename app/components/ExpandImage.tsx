"use client";
import Image from "next/image";
import React from "react";
import { useModal } from "../context/ModalContext";

export default function ExpandImage({
  image,
  name,
}: {
  image: string;
  name: string | null;
}) {
  const { showModal } = useModal();
  const imgURL = `${process.env.NEXT_PUBLIC_S3_URL}/${image}`;

  const handleImageClick = () => {
    showModal(
      <>
        <div className="relative w-full h-full">
          <Image
            src={imgURL}
            alt={name ?? "Modal image"}
            fill
            className="w-full h-11/12 object-contain cursor-pointer"
            onClick={() => window.open(imgURL, '_blank', 'noopener,noreferrer')}
          />
        </div>
      </>
    );
  };

  return (
    <Image
      src={imgURL}
      alt={name ?? "Food product image"}
      width={128}
      height={128}
      className="aspect-image h-full w-full max-w-52 object-cover cursor-zoom-in hover:scale-105 transition rounded"
      onClick={handleImageClick}
    />
  );
}
