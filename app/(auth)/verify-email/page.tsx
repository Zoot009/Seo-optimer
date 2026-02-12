"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyEmailForm() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }
    
    if (token) {
      setVerificationToken(token);
    }
  }, [email, token, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !verificationToken) {
      setError("Invalid verification session. Please try again.");
      return;
    }
    
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setError("Please enter the complete 4-digit OTP code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
          verificationToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log("Email verified successfully:", result.user);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 2000);
      } else {
        setError(result.message || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationToken(result.verificationToken);
        setOtp(["", "", "", ""]);
        // Focus first input
        const firstInput = document.getElementById("otp-0");
        firstInput?.focus();
      } else {
        setError(result.message || "Failed to resend code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Resend error:", err);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
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
              Verify Email to Complete Signup
            </h1>
            
            <p className="text-gray-600 mb-2 text-center">
              We have sent a 4 digit verification pin to your designated email address.
            </p>
            
            <p className="text-gray-500 mb-6 text-center">
              Please enter it below to complete your registration.
            </p>
            
            <p className="text-sm text-gray-500 mb-8 text-center">
              Note, your account will not be created until this step is completed.
            </p>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 text-center">
                <p className="font-semibold">Email Verified Successfully! ✓</p>
                <p>Redirecting to login page...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* OTP Input Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-4">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-20 h-20 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading || success}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-12 bg-[#FDB022] hover:bg-[#F5A623] text-white font-semibold text-lg rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>

            {/* Resend and Register Links */}
            <div className="text-center pt-6 space-y-2">
              <button
                onClick={handleResendCode}
                disabled={resendLoading || loading || success}
                className="text-[#0D6EFD] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Sending..." : "Resend code"}
              </button>
              
              <div>
                <Link href="/register" className="text-[#0D6EFD] hover:underline font-medium">
                  Register with a different email
                </Link>
              </div>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}