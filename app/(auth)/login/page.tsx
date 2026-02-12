"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { loginUser, isAuthenticated as checkAuth } from "@/lib/auth-client";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in
    if (checkAuth()) {
      router.push("/");
      return;
    }

    if (searchParams.get("verified") === "true") {
      setShowVerifiedMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => setShowVerifiedMessage(false), 5000);
    }
    
    if (searchParams.get("reset") === "success") {
      setShowResetMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => setShowResetMessage(false), 5000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Save token and user data to localStorage
        loginUser(result.token, result.user);
        
        // Redirect to dashboard/home page
        router.push("/");
      } else {
        // Handle specific error cases
        if (result.needsVerification) {
          setError(result.message + " We'll redirect you to verify your email.");
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          }, 2000);
        } else {
          setError(result.message || "Login failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        {/* Logo at top */}
        <div className="px-8 pt-8 pb-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">SEOmaster</span>
          </Link>
        </div>
        
        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">
            {/* Heading */}
            <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Login</h1>

            {/* Email Verified Success Message */}
            {showVerifiedMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                <p className="font-semibold">Email Verified Successfully! ✓</p>
                <p>You can now log in to your account.</p>
              </div>
            )}

            {/* Password Reset Success Message */}
            {showResetMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                <p className="font-semibold">Password Reset Successfully! ✓</p>
                <p>You can now log in with your new password.</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[#0D6EFD] hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FDB022] hover:bg-[#F5A623] text-white font-semibold text-lg rounded-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <span className="text-gray-500">Don't have an account? </span>
              <Link href="/register" className="text-[#0D6EFD] hover:underline font-medium">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D6EFD] items-center justify-center p-12 relative overflow-hidden">
        <div className="text-center z-10">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto mb-8">
            <div className="space-y-4">
              {/* Mock recommendation items */}
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm font-medium">Include a meta description tag</span>
                <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">High Priority</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm font-medium">Optimize for Core Web Vitals</span>
                <span className="text-xs text-white bg-orange-500 px-2 py-1 rounded">Medium Priority</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm font-medium">Noindex Tag Test</span>
                <span className="text-xs text-white bg-yellow-500 px-2 py-1 rounded">Low Priority</span>
              </div>
              
              {/* Performance Score */}
              <div className="mt-8 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#0D6EFD"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56 * 0.38} ${2 * Math.PI * 56}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="text-3xl font-bold text-[#0D6EFD]">B-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            SEO Audit & Reporting Tool
          </h2>
          <p className="text-xl text-white/90">
            + Comprehensive SEO Toolset
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-lg transform rotate-12"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-lg transform -rotate-12"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
