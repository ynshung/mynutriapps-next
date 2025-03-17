"use client";
import React, { useState } from "react";
import { auth } from "../lib/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import ModalComponent from "./ModalComponent";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [dialog, setDialog] = useState<{
    open: boolean;
    title?: string;
    body?: string;
  }>({
    open: false,
    title: undefined,
    body: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      router.push("/dashboard");
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === "auth/invalid-credential") {
        setDialog({
          open: true,
          title: "Login Error",
          body: "Invalid email or password. Please try again.",
        });
      } else if (error.code === "auth/too-many-requests") {
        setDialog({
          open: true,
          title: "Login Error",
          body: "Too many attempts. Please try again later.",
        });
      } else if (error.code === "auth/user-disabled") {
        setDialog({
          open: true,
          title: "Login Error",
          body: "This account has been disabled. Please contact support.",
        });
      } else if (error.code === "auth/user-token-expired") {
        setDialog({
          open: true,
          title: "Login Error",
          body: "User token expired. Please try logging in again or restarting the app.",
        });
      } else {
        setDialog({ // updated to fix incorrect function usage
          open: true,
          title: "Login Error",
          body: error.message
        });
        console.error(error);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="input">
          <span className="icon-[ic--outline-email] text-2xl opacity-60"></span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="input">
          <span className="icon-[ic--outline-lock] text-2xl opacity-60"></span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary font-montserrat">
          Login
        </button>
      </form>
      <ModalComponent title={dialog.title ?? ""} body={dialog.body ?? ""} open={dialog.open} onClose={() => setDialog({open: false})} button1="OK" />
    </>
  );
}

export default LoginComponent;
