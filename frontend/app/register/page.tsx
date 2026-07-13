"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ApiError, register } from "../_lib/auth/auth-client";
import { PressToRevealPassword } from "../components/press-to-reveal-password";

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
      await register({
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      router.replace("/feed");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "h-12 w-full rounded border border-[#e5e7eb] bg-white px-4 text-[#111827] outline-none transition focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/20";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f1f3f6] px-3 py-12 lg:py-[100px]">
      <Image aria-hidden alt="" src="/assets/images/shape1.svg" width={176} height={540} className="pointer-events-none absolute left-0 top-0 hidden lg:block" />
      <Image aria-hidden alt="" src="/assets/images/shape2.svg" width={568} height={400} className="pointer-events-none absolute right-5 top-0 hidden lg:block" />
      <Image aria-hidden alt="" src="/assets/images/shape3.svg" width={568} height={548} className="pointer-events-none absolute bottom-0 right-[327px] hidden lg:block" />
      <div className="relative mx-auto grid w-full max-w-[1320px] items-center lg:grid-cols-[2fr_1fr]">
        <div className="px-3 min-[992px]:-translate-y-10"><Image src="/assets/images/registration.png" alt="Join the BuddyScript community" width={1928} height={1422} className="h-auto w-full" /></div>
        <div className="px-3 max-lg:mt-[30px]">
        <section className="mx-auto w-full max-w-[416px] rounded-md bg-white p-8 sm:p-12">
          <Image src="/assets/images/logo.svg" alt="BuddyScript" width={158} height={33} className="mx-auto mb-7 h-auto w-[161px]" />
          <p className="mb-2 text-center text-base text-[#111827]">Get Started Now</p>
          <h1 className="mb-12 text-center text-[28px] font-medium text-[#111827]">Registration</h1>
          <button type="button" disabled className="mb-10 flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-[#e5e7eb] bg-white text-base font-medium text-[#111827]" title="Google registration will be added later">
            <Image src="/assets/images/google.svg" alt="" width={20} height={20} className="size-5" />
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
