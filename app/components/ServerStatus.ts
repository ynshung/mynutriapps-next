'use client';
export const getServerStatus = async () => {
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status`);
    return result.ok;
  } catch (error) {
    console.error("Error fetching server status:", error);
    return false;
  }
};
