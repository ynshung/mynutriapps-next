/* eslint-disable @next/next/no-img-element */

"use client";
import { useUser } from "@/app/context/UserContext";
import { filterKeyList, getProductImageUrl } from "@/app/utils/openFoodFacts";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { toast, ToastContainer } from "react-toastify";

interface ImageData {
  imgid: string;
  h: number;
  w: number;
}

interface ProductImages {
  barcode: number;
  front?: ImageData;
  nutrition?: ImageData;
  ingredients?: ImageData;
  productId?: number;
  status: string;
  [key: string]: ImageData | number | string | undefined;
}

interface ProductDataType {
  product: {
    images: {
      [key: string]: {
        imgid: string;
        sizes: {
          400: {
            h: number;
            w: number;
          };
          full: {
            h: number;
            w: number;
          };
        };
      };
    };
  };
}

//? TODO: Some images might not be available as the imageId is invalid,
//?       future implementation to keep the numbers keys and show to users which
//?       images can be used to replace it
export default function Page() {
  const { user } = useUser();
  const [imageModalSrc, setImageModalSrc] = useState<
    (ImageData & { barcode: number }) | null
  >(null);
  const imageModal = useRef<HTMLDialogElement>(null);

  const [products, setProducts] = useState<ProductImages[]>([]);

  // TODO: Currently only works on refresh and not Next.js routing
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    if (products.length > 0) {
      window.addEventListener('beforeunload', beforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [products]);

  const addProduct = async (barcode: number) => {
    const productImage: ProductImages = {
      barcode,
      status: "Loading images...",
    };

    // Check if product already exists
    if (products.some((product) => product.barcode === barcode)) {
      toast.error("Product already exists!");
      return;
    }

    setProducts((prev) => [...prev, productImage]);

    const imageDataUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?product_type=food&fields=images`;
    const response = await fetch(imageDataUrl);
    const data: ProductDataType = await response.json();

    const keyList = filterKeyList(Object.keys(data.product.images));

    keyList.forEach((key) => {
      const imageData = data.product.images[key];
      productImage[key.split("_")[0]] = {
        imgid: imageData.imgid,
        h: imageData.sizes["400"].h,
        w: imageData.sizes["400"].w,
      } as ImageData;
    });

    productImage.status = "Not Added";

    setProducts((prev) => {
      const index = prev.findIndex((p) => p.barcode === barcode);
      prev[index] = productImage;
      return [...prev];
    });
  };

  const handlePasteBarcodeList = async () => {
    const clipboardText = await navigator.clipboard.readText();
    const barcodes = [
      ...new Set(clipboardText.trim().split("\n").map(Number)),
    ].filter(
      (barcode) =>
        !isNaN(barcode) &&
        !products.some((product) => product.barcode === barcode)
    );

    if (barcodes.length === 0) {
      toast.error("No new barcodes found!");
      return;
    }

    if (barcodes.length > 80) {
      toast.info(`Adding ${barcodes.length} products (with rate limit)...`);
      for (const barcode of barcodes) {
        await addProduct(barcode);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } else {
      toast.info(`Adding ${barcodes.length} products...`);
      await Promise.all(barcodes.map(addProduct));
    }
    toast.success("Products added successfully!");
  };

  const ProductRow = ({
    product,
    index,
  }: {
    product: ProductImages;
    index: number;
  }) => {
    const [addingToDatabase, setAddingToDatabase] = useState(false);
    const addToDatabase = async () => {
      setAddingToDatabase(true);
      product.status = "Adding...";

      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL +
          "/api/v1/admin/product/create-from-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await user?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            barcode: product.barcode,
            frontLabel: product.front
              ? getProductImageUrl(product.barcode, product.front.imgid, false)
              : undefined,
            nutritionLabel: product.nutrition
              ? getProductImageUrl(product.barcode, product.nutrition.imgid, false)
              : undefined,
            ingredients: product.ingredients
              ? getProductImageUrl(product.barcode, product.ingredients.imgid, false)
              : undefined,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts((prev) =>
          prev.map((p) =>
            p.barcode === product.barcode
              ? { ...p, productId: data.data.product.id, status: "Added" }
              : p
          )
        );
      } else {
        console.error("Failed to add product!", response);
        toast.error("Failed to add product!");
      }

      setAddingToDatabase(false);
    };

    const ImageItem = ({ imgid, w, h }: ImageData) => {
      return (
        <img
          src={getProductImageUrl(product.barcode, imgid)}
          alt="Front Label"
          width={w}
          height={h}
          className="max-h-42 max-w-42 object-contain mx-auto cursor-zoom-in"
          onClick={() => {
            setImageModalSrc({ imgid, w, h, barcode: product.barcode });
            imageModal.current?.showModal();
          }}
        />
      );
    };

    return (
      <tr>
        <th>{index + 1}</th>
        <td>
          <div>
            <Barcode
              value={product.barcode.toString()}
              className="max-h-42 mx-auto w-42"
              format={product.barcode.toString().length === 13 ? "EAN13" : "CODE128"}
            />
          </div>
        </td>
        <td>
          {product.front && (
            <ImageItem
              imgid={product.front.imgid}
              w={product.front.w}
              h={product.front.h}
            />
          )}
        </td>
        <td>
          {product.nutrition && (
            <ImageItem
              imgid={product.nutrition.imgid}
              w={product.nutrition.w}
              h={product.nutrition.h}
            />
          )}
        </td>
        <td>
          {product.ingredients && (
            <ImageItem
              imgid={product.ingredients.imgid}
              w={product.ingredients.w}
              h={product.ingredients.h}
            />
          )}
        </td>
        <td className="w-32">{product.status}</td>
        <td className="w-32">
          <div className="flex gap-2 flex-wrap justify-center">
            {product.productId !== undefined ? (
              <a
                href={`/dashboard/food-database/${product.productId}`}
                title="Edit Product"
                className="icon-[material-symbols--edit] text-3xl cursor-pointer text-gray-600 hover:text-primary transition"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
            ) : (
              <>
                {addingToDatabase ? (
                  <span className="loading loading-spinner loading-lg"></span>
                ) : (
                  <span
                    title="Add to Database"
                    className="icon-[material-symbols--add-circle] text-3xl cursor-pointer text-gray-600 hover:text-primary transition"
                    onClick={async () => {
                      await addToDatabase();
                    }}
                  ></span>
                )}
              </>
            )}
            <span
              title="Remove Product"
              className="icon-[mdi--bin] text-3xl cursor-pointer text-gray-600 hover:text-error transition"
              onClick={() =>
                setProducts((prev) =>
                  prev.filter((p) => p.barcode !== product.barcode)
                )
              }
            ></span>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <main className="m-8">
      <ToastContainer />
      <div className="flex flex-row gap-4 items-center">
        <Link
          href="/dashboard/food-database"
          className="btn btn-circle btn-xl btn-ghost"
        >
          <span className="icon-[material-symbols--chevron-left-rounded] text-5xl"></span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Batch Add</h1>
          <p>Add multiple food product at once.</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-base-100 rounded shadow">
        <div className="flex gap-2 mb-4 items-center">
          <button
            className="btn btn-primary"
            onClick={async () => {
              const barcode = parseInt(prompt("Enter barcode: ") || "");
              if (barcode) {
                await addProduct(barcode);
              }
            }}
          >
            <span className="icon-[material-symbols--add] text-xl"></span>
            Add New Product
          </button>
          <button
            className="btn btn-primary btn-outline"
            onClick={handlePasteBarcodeList}
          >
            <span className="icon-[material-symbols--content-paste] text-xl"></span>
            Paste Barcode List
          </button>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Barcode</th>
                  <th>Front Label</th>
                  <th>Nutrition Table</th>
                  <th>Ingredients</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <ProductRow
                    key={`${product.barcode}-${index}`}
                    product={product}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
              <img
                src={getProductImageUrl(
                  imageModalSrc.barcode,
                  imageModalSrc.imgid
                )}
                alt="Modal image"
                width={imageModalSrc.w}
                height={imageModalSrc.h}
                className="w-full h-11/12 object-contain"
              />
              <p className="text-center mx-auto block my-6 text-sm">
                Full image:&nbsp;
                <a
                  href={getProductImageUrl(
                    imageModalSrc.barcode,
                    imageModalSrc.imgid,
                    false
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {getProductImageUrl(
                    imageModalSrc.barcode,
                    imageModalSrc.imgid,
                    false
                  )}
                </a>
                &nbsp;
                <span className="icon-[mdi--external-link]"></span>
              </p>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </main>
  );
}
