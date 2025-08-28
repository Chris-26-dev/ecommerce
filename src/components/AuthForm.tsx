"use client";

import { useState } from "react";
import Link from "next/link";
import SocialProviders from "./SocialProviders";
import {useRouter} from "next/navigation";
import { ShoppingBag } from "lucide-react";

type Props = {
  mode: "sign-in" | "sign-up";
  onSubmit: (formData: FormData) => Promise<{ ok: boolean; userId?: string } | void>;
};

export default function AuthForm({ mode, onSubmit }: Props) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      const result = await onSubmit(formData);

      if(result?.ok) router.push("/");
    } catch (e) {
      console.log("error", e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-caption text-dark-700">
          {mode === "sign-in" ? "Don’t have an account? " : "Already have an account? "}
          <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"} className="underline">
            {mode === "sign-in" ? "Sign Up" : "Sign In"}
          </Link>
        </p>
        <h1 className="mt-3 text-heading-3 text-dark-900">
          {mode === "sign-in" ? "Welcome Back!" : "Join Nike Today!"}
        </h1>
        <p className="mt-1 text-body text-dark-700">
          {mode === "sign-in"
            ? "Sign in to continue your journey"
            : "Create your account to start your fitness journey"}
        </p>
      </div>

      <SocialProviders variant={mode} />

      <div className="flex items-center gap-4">
        <hr className="h-px w-full border-0 bg-light-300" />
        <span className="shrink-0 text-caption text-dark-700">
          Or {mode === "sign-in" ? "sign in" : "sign up"} with
        </span>
        <hr className="h-px w-full border-0 bg-light-300" />
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {mode === "sign-up" && (
          <div className="space-y-1">
            <label htmlFor="name" className="text-caption text-dark-900">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-caption text-dark-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="johndoe@gmail.com"
            className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-caption text-dark-900">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              placeholder="minimum 8 characters"
              className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minLength={8}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-caption text-dark-700"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-900/20"
        >
          {mode === "sign-in" ? "Sign In" : "Sign Up"}
        </button>

        {/* New: prominent secondary button to redirect to homepage */}
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Go to homepage"
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full border border-light-300 bg-white px-6 py-3 text-body-medium text-dark-900 hover:bg-light-100 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
        >
          {/* simple home icon */}
          <ShoppingBag className="h-4 w-4" />
          <span>Go Shopping</span>
        </button>

        {mode === "sign-up" && (
          <p className="text-center text-footnote text-dark-700">
            By signing up, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </p>
        )}
      </form>
    </div>
  );
}