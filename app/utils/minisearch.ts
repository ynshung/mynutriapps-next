import MiniSearch from "minisearch";
import { db } from "../db";
import {
  foodCategoryTable,
  foodProductsTable,
  imageFoodProductsTable,
  imagesTable,
} from "../db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { FoodProductDatabaseType } from "../components/FoodProductList";

type ProductSearchResult = {
  id: number;
  name: string | null;
  brand: string | null;
  barcode: string[] | null;
};

const getProductMS = async (): Promise<ProductSearchResult[]> => {
  const data = await db
    .select({
      id: foodProductsTable.id,
      name: foodProductsTable.name,
      brand: foodProductsTable.brand,
      barcode: foodProductsTable.barcode,
    })
    .from(foodProductsTable)
    .innerJoin(
      foodCategoryTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    );

  // Replace diacritics
  return data.map((item) => ({
    ...item,
    name: item.name ? item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "",
    brand: item.brand ? item.brand.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "",
  }));
};

export const searchProductsMS = async (
  query: string,
  page: number = 0,
  limit: number = 10
): Promise<{data: FoodProductDatabaseType[], total: number}> => {
  const miniSearch = new MiniSearch({
    fields: ["name", "brand", "barcode"],
    storeFields: ["id"],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  });

  const data = await getProductMS();
  miniSearch.addAll(data);
  const result = miniSearch.search(query);
  const idList = result.map((r) => r.id).slice(page * limit, (page + 1) * limit);

  const dbQuery = await db
    .select({
      id: foodProductsTable.id,
      name: foodProductsTable.name,
      barcode: foodProductsTable.barcode,
      brand: foodProductsTable.brand,
      category: foodCategoryTable.name,
      categoryId: foodProductsTable.foodCategoryId,
      image: imagesTable.imageKey,
      imageKeys: sql<typeof imagesTable.$inferSelect[]>`json_agg(${imagesTable})`,
      imageType: sql<typeof imageFoodProductsTable.$inferSelect[]>`json_agg(${imageFoodProductsTable})`,
      verified: foodProductsTable.verified,
    })
    .from(foodProductsTable)
    .innerJoin(
      imageFoodProductsTable,
      eq(imageFoodProductsTable.foodProductId, foodProductsTable.id)
    )
    .innerJoin(imagesTable, eq(imageFoodProductsTable.imageId, imagesTable.id))
    .innerJoin(
      foodCategoryTable,
      eq(foodProductsTable.foodCategoryId, foodCategoryTable.id)
    )
    .where(
      and(
        inArray(foodProductsTable.id, idList),
        eq(imageFoodProductsTable.type, "front")
      )
    )
    .orderBy(
      sql`ARRAY_POSITION(ARRAY[${sql.join(idList, sql`, `)}]::INTEGER[], ${
        foodProductsTable.id
      })`
    )
    .groupBy(
      foodProductsTable.id,
      foodProductsTable.name,
      foodProductsTable.barcode,
      foodProductsTable.brand,
      foodCategoryTable.name,
      foodProductsTable.foodCategoryId,
      foodProductsTable.verified,
      imagesTable.imageKey,
      imageFoodProductsTable.type
    )

  const productData = dbQuery.map((item) => {
    const imageType = item.imageType;
    const imageKeys = item.imageKeys;
    const images = imageType.reduce((acc, image, index) => {
      acc[image.type] = imageKeys[index];
      return acc;
    }, {} as Record<string, { imageKey: string }>);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageKeys: _, imageType: __, ...rest } = item;
    return {
      ...rest,
      images,
    };
  });

  return {data: productData, total: result.length};
};
