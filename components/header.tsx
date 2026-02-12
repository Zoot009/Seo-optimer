"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="w-full bg-white">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">SEOmaster</span>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-[70%]">
            <button className="text-lg font-semibold text-foreground hover:text-[#FDB022] transition-colors flex items-center gap-1">
              Features
              <ChevronDown className="h-4 w-4" />
            </button>
            <a href="#pricing" className="text-lg font-semibold text-foreground hover:text-[#FDB022] transition-colors">
              Pricing
            </a>
            <button className="text-lg font-semibold text-foreground hover:text-[#FDB022] transition-colors flex items-center gap-1">
              Resources
              <ChevronDown className="h-4 w-4" />
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <span className="hidden md:inline-flex text-base font-medium">US</span>
            
            {isAuthenticated ? (
              <>
                {/* Back to My Account Button */}
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    className="hidden md:inline-flex border-2 border-foreground rounded-lg px-6 h-11 font-semibold hover:bg-[#FDB022] hover:text-white hover:border-[#FDB022] transition-all"
                  >
                    Back to My Account
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-flex text-lg font-medium hover:text-[#FDB022] gap-2 h-auto p-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 5V3M8 13V11M11 8H13M3 8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="outline" 
                    className="hidden md:inline-flex border-2 border-foreground rounded-lg px-6 h-11 font-semibold hover:bg-[#FDB022] hover:text-white hover:border-[#FDB022] transition-all"
                  >
                    Premium - Free Trial
                  </Button>
                </Link>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-6 space-y-4">
            <button className="block text-base font-medium hover:text-[#FDB022] transition-colors">
              Features
            </button>
            <a href="#pricing" className="block text-base font-medium hover:text-[#FDB022] transition-colors">
              Pricing
            </a>
            <button className="block text-base font-medium hover:text-[#FDB022] transition-colors">
              Resources
            </button>
            <div className="pt-4 border-t space-y-3">
              {isAuthenticated ? (
                <Link href="/dashboard" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-foreground hover:bg-[#FDB022] hover:text-white hover:border-[#FDB022] font-semibold"
                  >
                    Back to My Account
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full justify-start hover:text-[#FDB022]">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full border-2 border-foreground hover:bg-[#FDB022] hover:text-white hover:border-[#FDB022]">
                      Premium - Free Trial
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
