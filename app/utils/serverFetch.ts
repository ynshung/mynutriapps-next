"use server";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

export const serverCreateFromURL = async (body: object, userToken?: string) => {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/product/create-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return {
      status: "error",
      message: await response.text(),
    }
  }
  return response.json();
};

export const serverInferenceImage = async (
  formData: FormData,
  userToken?: string
) => {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/product/inference`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    body: formData,
  });
  if (!response.ok) {
    return {
      status: "error",
      message: await response.text(),
    }
  }
  return {
    status: "success",
    data: await response.json(),
  }
}

export const serverSubmitProduct = async (
  formData: FormData,
  userToken?: string
) => {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/product/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    body: formData,
  });
  if (!response.ok) {
    return {
      status: "error",
      message: await response.text(),
    }
  }
  return {
    status: "success",
    data: await response.json(),
  };
};

export const serverEditProduct = async (
  editingProduct: number,
  formData: FormData,
  userToken?: string
) => {
  const response = await fetch(`${SERVER_URL}/api/v1/admin/product/edit/${editingProduct}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    body: formData,
  });
  if (!response.ok) {
    return {
      status: "error",
      message: await response.text(),
    }
  }
  return {
    status: "success",
    data: await response.json(),
  };
};
