'use server';

import { db } from "../db";
import { usersTable } from "../db/schema";

export const getDatabaseStatus = async () => {
  try {
    await db.select().from(usersTable).limit(1);
    return true;
  } catch (error) {
    console.error("Error fetching database status:", error);
    return false;
  }
};
