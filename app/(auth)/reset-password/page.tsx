"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const resetToken = searchParams.get("token");

  useEffect(() => {
    if (!email || !resetToken) {
      router.push("/forgot-password");
    }
  }, [email, resetToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !resetToken) {
      setError("Invalid password reset session. Please try again.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          resetToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log("Password reset successfully");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 3000);
      } else {
        setError(result.message || "Password reset failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !resetToken) {
    return null; // Will redirect
  }

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
            <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
              Create New Password
            </h1>
            
            <p className="text-gray-600 mb-8 text-center">
              Please enter your new password below.
            </p>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 text-center">
                <p className="font-semibold">Password Reset Successfully! ✓</p>
                <p>Redirecting to login page...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
                  required
                  disabled={loading || success}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
                  required
                  disabled={loading || success}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-12 bg-[#FDB022] hover:bg-[#F5A623] text-white font-semibold text-lg rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center pt-6">
              <Link href="/login" className="text-[#0D6EFD] hover:underline font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              SEO Audit & Reporting Tool
            </h2>
            <p className="text-xl opacity-90">
              + Comprehensive SEO Toolset
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}