"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import useAuth from "../../../hooks/useAuth";

// 1. Declare validation schema using Zod
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Infer the form inputs type from the Zod schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 2. Configure react-hook-form with the zod resolver
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

  // 3. Handle submit action calling context login
  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      // Parse backend API message
      const errorMsg =
        err.response?.data?.detail || "Invalid credentials. Please try again.";
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.26),rgba(255,255,255,0))]">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 backdrop-blur-xl shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            53
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Sign in to AWS Console
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            AWS Route 53 Clone Account Management
          </p>
        </div>

        {/* Form Element */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Global Alert for API Errors */}
          {apiError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail size={16} />
                </span>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="admin@route53.aws"
                  className={`h-11 w-full rounded-xl border bg-zinc-800/40 pl-10 pr-4 text-sm text-zinc-200 transition-all placeholder:text-zinc-500 focus:outline-none focus:ring-1 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {errors.email && (
                <span className="mt-1 block text-xs font-medium text-red-400">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`h-11 w-full rounded-xl border bg-zinc-800/40 pl-10 pr-4 text-sm text-zinc-200 transition-all placeholder:text-zinc-500 focus:outline-none focus:ring-1 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {errors.password && (
                <span className="mt-1 block text-xs font-medium text-red-400">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 transition-all duration-300 hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
