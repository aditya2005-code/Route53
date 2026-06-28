"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "../../../services/auth.service";
import useToast from "../../../hooks/useToast";
import { Button } from "../../../components/ui/Button";

// Zod validation schema matching register requirements
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await authService.register(data.name, data.email, data.password);
      showToast("Account created successfully.", "success");
      router.push("/login");
    } catch (err: any) {
      console.error("User registration failed:", err);
      const errorMsg =
        err.response?.data?.detail || "Registration failed. Verify credentials and connection.";
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
            Create AWS Console Account
          </h1>
        </div>

        {/* Flat White Container Card */}
        <div className="bg-white border border-[#d5dbdb] p-8 shadow-sm rounded-sm">
          <h2 className="text-lg font-normal mb-6 text-[#111111]">
            Register
          </h2>

          {/* Form Action */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* Global API Error Alert (AWS Styled) */}
            {apiError && (
              <div 
                className="flex items-start gap-3 border-l-4 border-[#d13212] bg-[#fdf3f2] p-4 text-sm text-[#111111] rounded-sm"
                role="alert"
                aria-live="assertive"
              >
                <ShieldAlert className="text-[#d13212] shrink-0 mt-0.5" size={16} />
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-[#d13212]">Registration Alert</span>
                  <span className="text-xs">{apiError}</span>
                </div>
              </div>
            )}

            {/* Name Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="reg-name" 
                className="block text-sm font-bold text-[#111111]"
              >
                Full name <span className="text-[#d13212] font-normal">*</span>
              </label>
              <input
                {...register("name")}
                id="reg-name"
                type="text"
                placeholder="e.g. John Doe"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "reg-name-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-sm bg-white text-[#111111] transition-all outline-none focus:ring-1 ${
                  errors.name
                    ? "border-[#d13212] focus:border-[#d13212] focus:ring-[#d13212]"
                    : "border-[#aab7b7] focus:border-[#e47911] focus:ring-[#e47911]"
                }`}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <span 
                  id="reg-name-error" 
                  className="mt-1 block text-xs font-semibold text-[#d13212] flex items-center gap-1"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.name.message}
                </span>
              )}
            </div>

            {/* Email Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="reg-email" 
                className="block text-sm font-bold text-[#111111]"
              >
                Email address <span className="text-[#d13212] font-normal">*</span>
              </label>
              <input
                {...register("email")}
                id="reg-email"
                type="email"
                placeholder="admin@route53.aws"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "reg-email-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-sm bg-white text-[#111111] transition-all outline-none focus:ring-1 ${
                  errors.email
                    ? "border-[#d13212] focus:border-[#d13212] focus:ring-[#d13212]"
                    : "border-[#aab7b7] focus:border-[#e47911] focus:ring-[#e47911]"
                }`}
                disabled={isSubmitting}
                required
              />
              {errors.email && (
                <span 
                  id="reg-email-error" 
                  className="mt-1 block text-xs font-semibold text-[#d13212] flex items-center gap-1"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="reg-password" 
                className="block text-sm font-bold text-[#111111]"
              >
                Password <span className="text-[#d13212] font-normal">*</span>
              </label>
              <input
                {...register("password")}
                id="reg-password"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "reg-password-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-sm bg-white text-[#111111] transition-all outline-none focus:ring-1 ${
                  errors.password
                    ? "border-[#d13212] focus:border-[#d13212] focus:ring-[#d13212]"
                    : "border-[#aab7b7] focus:border-[#e47911] focus:ring-[#e47911]"
                }`}
                disabled={isSubmitting}
                required
              />
              {errors.password && (
                <span 
                  id="reg-password-error" 
                  className="mt-1 block text-xs font-semibold text-[#d13212] flex items-center gap-1"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="reg-confirm-password" 
                className="block text-sm font-bold text-[#111111]"
              >
                Confirm password <span className="text-[#d13212] font-normal">*</span>
              </label>
              <input
                {...register("confirmPassword")}
                id="reg-confirm-password"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "reg-confirm-password-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-sm bg-white text-[#111111] transition-all outline-none focus:ring-1 ${
                  errors.confirmPassword
                    ? "border-[#d13212] focus:border-[#d13212] focus:ring-[#d13212]"
                    : "border-[#aab7b7] focus:border-[#e47911] focus:ring-[#e47911]"
                }`}
                disabled={isSubmitting}
                required
              />
              {errors.confirmPassword && (
                <span 
                  id="reg-confirm-password-error" 
                  className="mt-1 block text-xs font-semibold text-[#d13212] flex items-center gap-1"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Blue Primary Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full h-9 rounded-[3px] mt-6"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>

          {/* Link back to Sign In */}
          <div className="mt-6 text-center text-xs border-t border-[#eaeded] pt-4">
            <span className="text-zinc-500">Already have an account? </span>
            <Link href="/login" className="text-[#0066cc] hover:text-[#004b93] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>

        {/* AWS Support Helper Footer Box */}
        <div className="bg-white border border-[#d5dbdb] p-4 text-xs text-zinc-500 rounded-sm">
          <div className="flex gap-2 items-start">
            <Info size={14} className="text-[#0066cc] shrink-0 mt-0.5" />
            <p>
              Your AWS billing settings and service controls will automatically configure based on your domain profiles. Contact AWS Support for guidance.
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
