"use client"
import { auth } from "@/app/lib/client";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";

export default function Dev() {

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user);
        console.log(token);
      }
    });
    return () => unsub();
  }, []);
  

  return (
    <main>
      <h1>Welcome to the Dev Page</h1>
      <p>Your dev page is ready for your activities.</p>
      <ul>
      </ul>
    </main>
  );
}
