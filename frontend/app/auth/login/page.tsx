"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, Info } from "lucide-react";
import Link from "next/link";
import useAuth from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/Button";

// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail || "Authentication failed. Please check your credentials.";
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#111111] font-sans flex flex-col items-center justify-between py-12 px-4">
      {/* Centered Container */}
      <div className="w-full max-w-[390px] flex flex-col space-y-6">
        
        {/* Flat Logo Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1">
            <svg
              className="h-8 w-12 text-[#111111]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              aws
            </span>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            Sign in to AWS Console
          </h1>
        </div>

        {/* Flat White Container Card */}
        <div className="bg-white border border-[#d5dbdb] p-8 shadow-sm rounded-sm">
          <h2 className="text-lg font-normal mb-6 text-[#111111]">
            Sign in
          </h2>

          {/* Form Action */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* Global API Error Alert (AWS Styled) */}
            {apiError && (
              <div 
                className="flex items-start gap-3 border-l-4 border-[#d13212] bg-[#fdf3f2] p-4 text-sm text-[#111111] rounded-sm"
                role="alert"
                aria-live="assertive"
              >
                <ShieldAlert className="text-[#d13212] shrink-0 mt-0.5" size={16} />
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-[#d13212]">Authentication Alert</span>
                  <span className="text-xs">{apiError}</span>
                </div>
              </div>
            )}

            {/* Simulated AWS User Type Selector (Static Flat Display) */}
            <div className="space-y-2 border-b border-[#eaeded] pb-4">
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  defaultChecked
                  className="accent-[#e47911] h-4 w-4"
                  disabled
                />
                <span>Root user</span>
              </label>
              <p className="pl-6 text-xs text-zinc-500">
                Manage hosted zones and settings
              </p>
            </div>

            {/* Email Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="email" 
                className="block text-sm font-bold text-[#111111]"
              >
                Root user email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="admin@route53.aws"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-sm bg-white text-[#111111] transition-all outline-none focus:ring-1 ${
                  errors.email
                    ? "border-[#d13212] focus:border-[#d13212] focus:ring-[#d13212]"
                    : "border-[#aab7b7] focus:border-[#e47911] focus:ring-[#e47911]"
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <span 
                  id="email-error" 
                  className="mt-1 block text-xs font-semibold text-[#d13212] flex items-center gap-1"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Input Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-bold text-[#111111]"
                >
                  Password
                </label>
                <a 
                  href="#" 
                  className="text-xs text-[#0066cc] hover:text-[#004b93] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                {...register("password")}
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-sm bg-white text-[#111111] transition-all outline-none focus:ring-1 ${
                  errors.password
                    ? "border-[#d13212] focus:border-[#d13212] focus:ring-[#d13212]"
                    : "border-[#aab7b7] focus:border-[#e47911] focus:ring-[#e47911]"
                }`}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span 
                  id="password-error" 
                  className="mt-1 block text-xs font-semibold text-[#d13212] flex items-center gap-1"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.password.message}
                </span>
              )}
            </div>

            {/* Blue Primary Button (AWS Flat Action Button) */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full h-9 rounded-[3px]"
            >
              Sign In
            </Button>
          </form>

          {/* Link to Register */}
          <div className="mt-6 text-center text-xs border-t border-[#eaeded] pt-4">
            <span className="text-zinc-500">Don't have an account? </span>
            <Link href="/auth/register" className="text-[#0066cc] hover:text-[#004b93] hover:underline font-bold">
              Register
            </Link>
          </div>
        </div>

        {/* AWS Support Helper Footer Box */}
        <div className="bg-white border border-[#d5dbdb] p-4 text-xs text-zinc-500 rounded-sm">
          <div className="flex gap-2 items-start">
            <Info size={14} className="text-[#0066cc] shrink-0 mt-0.5" />
            <p>
              By signing in, you agree to the AWS Customer Agreement. For Route 53 Clone setup queries, contact AWS Support.
            </p>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="text-xs text-zinc-500 mt-12 flex gap-4">
        <a href="#" className="hover:underline">Terms of Use</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <span>© 2026, Amazon Web Services, Inc.</span>
      </footer>
    </div>
  );
}
