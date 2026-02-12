"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated as checkAuth } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    subscribe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (checkAuth()) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log("User registered successfully:", result.user);
        
        // Redirect to email verification page
        const email = encodeURIComponent(formData.email);
        const token = encodeURIComponent(result.verificationToken);
        setTimeout(() => {
          router.push(`/verify-email?email=${email}&token=${token}`);
        }, 1000);
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
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
            <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Sign Up</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
                  required
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <Input
                type="text"
                placeholder="Company Name (Optional)"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="h-12 bg-[#F8F9FA] border-gray-300 text-base"
              />
            </div>

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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <p className="font-semibold">Registration successful!</p>
                <p>Please check your email for verification code. Redirecting...</p>
              </div>
            )}

            {/* Subscribe Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="subscribe"
                checked={formData.subscribe}
                onChange={(e) =>
                  setFormData({ ...formData, subscribe: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="subscribe" className="text-sm text-gray-600 leading-tight">
                Subscribe me to the mailing list to receive SEOmaster news and announcements
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FDB022] hover:bg-[#F5A623] text-white font-semibold text-lg rounded-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Next"}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <span className="text-gray-500">Already have an Account? </span>
              <Link href="/login" className="text-[#0D6EFD] hover:underline font-medium">
                Login
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
