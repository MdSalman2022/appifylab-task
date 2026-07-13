"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { PressToRevealPassword } from "../components/press-to-reveal-password";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function RegistrationPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("repeatPassword")) {
      setError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.get("firstName"), lastName: form.get("lastName"), email: form.get("email"), password: form.get("password") }),
      });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) {
        setError(body.error?.message ?? "Unable to create account");
        return;
      }
      router.replace("/feed");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "h-12 w-full rounded border border-[#e5e7eb] bg-white px-4 text-[#111827] outline-none transition focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f1f3f6] px-3 py-12 lg:py-[100px]">
      <img aria-hidden alt="" src="/assets/images/shape1.svg" className="pointer-events-none absolute left-0 top-0 hidden lg:block" />
      <img aria-hidden alt="" src="/assets/images/shape2.svg" className="pointer-events-none absolute right-5 top-0 hidden lg:block" />
      <img aria-hidden alt="" src="/assets/images/shape3.svg" className="pointer-events-none absolute bottom-0 right-[327px] hidden lg:block" />
      <div className="relative mx-auto grid w-full max-w-[1320px] items-center lg:grid-cols-[2fr_1fr]">
        <div className="px-3 min-[992px]:-translate-y-10"><img src="/assets/images/registration.png" alt="Join the BuddyScript community" className="h-auto w-full" /></div>
        <div className="px-3 max-lg:mt-[30px]">
        <section className="mx-auto w-full max-w-[416px] rounded-md bg-white p-8 sm:p-12">
          <img src="/assets/images/logo.svg" alt="BuddyScript" className="mx-auto mb-7 h-auto w-[161px]" />
          <p className="mb-2 text-center text-base text-[#111827]">Get Started Now</p>
          <h1 className="mb-12 text-center text-[28px] font-medium text-[#111827]">Registration</h1>
          <button type="button" disabled className="mb-10 flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-[#e5e7eb] bg-white text-base font-medium text-[#111827]" title="Google registration will be added later">
            <img src="/assets/images/google.svg" alt="" className="h-5 w-5" />
            Register with google
          </button>
          <div className="mb-10 flex items-center gap-5 text-sm text-[#b8b8b8]"><span className="h-px flex-1 bg-[#d8d8d8]" /><span>Or</span><span className="h-px flex-1 bg-[#d8d8d8]" /></div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="First name" name="firstName" autoComplete="given-name" className={inputClass} />
              <Field label="Last name" name="lastName" autoComplete="family-name" className={inputClass} />
            </div>
            <Field label="Email" name="email" type="email" autoComplete="email" className={inputClass} />
            <PressToRevealPassword id="password" name="password" label="Password" autoComplete="new-password" minLength={12} className={inputClass} />
            <PressToRevealPassword id="repeatPassword" name="repeatPassword" label="Repeat Password" autoComplete="new-password" minLength={12} className={inputClass} />
            <label className="flex items-center gap-2 pt-2 text-sm text-[#1f2937]"><input type="checkbox" required defaultChecked className="size-4 accent-[#4f8cff]" />I agree to terms &amp; conditions</label>
            {error && <p role="alert" className="text-sm text-[#d92d20]">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="mt-10 h-12 w-full rounded bg-[#4f8cff] font-semibold text-white transition hover:bg-[#3979ea] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Creating account..." : "Create account"}</button>
          </form>
          <p className="mt-[60px] text-center text-sm text-[#6b7280]">Already have an account? <Link href="/login" className="text-[#4f73ff] hover:underline">Login</Link></p>
        </section>
      </div>
      </div>
    </main>
  );
}

function Field({ label, name, type = "text", autoComplete, minLength, className }: { label: string; name: string; type?: string; autoComplete: string; minLength?: number; className: string }) {
  return <div><label htmlFor={name} className="mb-1.5 block text-sm font-medium text-[#1f2937]">{label}</label><input id={name} name={name} type={type} required minLength={minLength} maxLength={type === "password" ? 128 : undefined} autoComplete={autoComplete} className={className} /></div>;
}
