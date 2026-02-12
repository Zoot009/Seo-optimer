"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Redirect to OTP verification page
        const encodedEmail = encodeURIComponent(email);
        const token = encodeURIComponent(result.verificationToken);
        setTimeout(() => {
          router.push(`/reset-password-verify?email=${encodedEmail}&token=${token}`);
        }, 2000);
      } else {
        setError(result.message || "Failed to send reset code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Forgot password error:", err);
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
            <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
              Forgot Password?
            </h1>
            
            <p className="text-gray-600 mb-8 text-center">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                <p className="font-semibold">Reset code sent successfully!</p>
                <p>Please check your email for the verification code. Redirecting...</p>
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
              {/* Email */}
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending..." : "Send Reset Code"}
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