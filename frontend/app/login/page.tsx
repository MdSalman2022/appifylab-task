"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ApiError, login } from "../_lib/auth/auth-client";
import { PressToRevealPassword } from "../components/press-to-reveal-password";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
        rememberMe: form.get("rememberMe") === "on",
      });
      router.replace("/feed");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to log in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f1f3f6] px-3 py-12 lg:py-[100px]">
      <Image aria-hidden alt="" src="/assets/images/shape1.svg" width={176} height={540} className="pointer-events-none absolute left-0 top-0 hidden lg:block" />
      <Image aria-hidden alt="" src="/assets/images/shape2.svg" width={568} height={400} className="pointer-events-none absolute right-5 top-0 hidden lg:block" />
      <Image aria-hidden alt="" src="/assets/images/shape3.svg" width={568} height={548} className="pointer-events-none absolute bottom-0 right-[327px] hidden lg:block" />

      <div className="relative mx-auto grid w-full max-w-[1320px] items-center lg:grid-cols-[2fr_1fr]">
        <div className="px-3">
          <Image src="/assets/images/login.png" alt="People connecting through BuddyScript" width={1269} height={1240} className="h-auto w-full max-w-[633px]" />
        </div>

        <div className="px-3 max-lg:mt-[30px]">
        <section className="mx-auto w-full max-w-[416px] rounded-md bg-white p-8 sm:p-12">
          <Image src="/assets/images/logo.svg" alt="BuddyScript" width={158} height={33} className="mx-auto mb-7 h-auto w-[161px]" />
          <p className="mb-2 text-center text-base text-[#111827]">Welcome back</p>
          <h1 className="mb-12 text-center text-[28px] font-medium leading-tight text-[#111827]">Login to your account</h1>

          <button type="button" disabled className="mb-10 flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded border border-[#e5e7eb] bg-white text-base font-medium text-[#111827]" title="Google login is outside the task scope">
            <Image src="/assets/images/google.svg" alt="" width={20} height={20} className="size-5" />
            Or sign-in with google
          </button>

          <div className="mb-10 flex items-center gap-5 text-sm text-[#b8b8b8]"><span className="h-px flex-1 bg-[#d8d8d8]" /><span>Or</span><span className="h-px flex-1 bg-[#d8d8d8]" /></div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1f2937]">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="mb-4 h-12 w-full rounded border border-[#e5e7eb] bg-white px-4 text-[#111827] outline-none transition focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20" />

            <PressToRevealPassword id="password" name="password" label="Password" autoComplete="current-password" containerClassName="mb-4" className="h-12 w-full rounded border border-[#e5e7eb] bg-white px-4 text-[#111827] outline-none transition focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20" />

            <div className="mb-10 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#1f2937]"><input name="rememberMe" type="checkbox" defaultChecked className="size-4 accent-[#4f8cff]" />Remember me</label>
              <span className="text-[#4f8cff]">Forgot password?</span>
            </div>

            {error && <p role="alert" className="mb-3 text-sm text-[#d92d20]">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="h-12 w-full rounded bg-[#4f8cff] font-semibold text-white transition hover:bg-[#3979ea] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Logging in..." : "Login now"}</button>
          </form>

          <p className="mt-[60px] text-center text-sm text-[#6b7280]">Dont have an account? <Link href="/register" className="text-[#4f73ff] hover:underline">Create New Account</Link></p>
        </section>
      </div>
      </div>
    </main>
  );
}
