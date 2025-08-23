import Image from "next/image";
import { FaApple, FaGoogle } from "react-icons/fa";

type Props = { variant?: "sign-in" | "sign-up" };

export default function SocialProviders({ variant = "sign-in" }: Props) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
        aria-label={`${variant === "sign-in" ? "Continue" : "Sign up"} with Google`}
      >
        <FaGoogle />
        <span>Continue with Google</span>
      </button>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
        aria-label={`${variant === "sign-in" ? "Continue" : "Sign up"} with Apple`}
      >
        <FaApple />
        <span>Continue with Apple</span>
      </button>
    </div>
  );
}