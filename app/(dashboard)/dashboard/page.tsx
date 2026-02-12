"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronRight, ChevronDown, FileText, FileCheck, Globe, ClipboardList, Search, TrendingUp, Link as LinkIcon, BarChart3, Settings, User, Users, LogOut, Circle, HelpCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("seomaster_auth_token");
    localStorage.removeItem("seomaster_user");
    router.push("/login");
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const userData = getUser();
    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">SEOmaster</span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          <button
            onClick={() => setActiveMenu("Dashboard")}
            className={`w-full px-6 py-3 text-left font-medium transition-colors ${
              activeMenu === "Dashboard" ? "bg-[#2d3748] text-white" : "text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            }`}
          >
            Dashboard
          </button>

          {/* Auditing */}
          <div>
            <button
              onClick={() => toggleMenu("Auditing")}
              className="w-full px-6 py-3 text-left font-medium transition-colors flex items-center justify-between text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            >
              Auditing
              {expandedMenus.includes("Auditing") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedMenus.includes("Auditing") && (
              <div className="bg-[#0a0a0a]">
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  Report Templates
                </button>
                <Link href="/white-label-reports">
                  <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                    <FileCheck className="h-4 w-4" />
                    White Label Reports
                  </button>
                </Link>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  Website Crawls
                </button>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <ClipboardList className="h-4 w-4" />
                  Task Management
                </button>
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <button
              onClick={() => toggleMenu("Keywords")}
              className="w-full px-6 py-3 text-left font-medium transition-colors flex items-center justify-between text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            >
              Keywords
              {expandedMenus.includes("Keywords") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedMenus.includes("Keywords") && (
              <div className="bg-[#0a0a0a]">
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <Search className="h-4 w-4" />
                  Keyword Research
                </button>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <TrendingUp className="h-4 w-4" />
                  Keyword Tracking
                </button>
              </div>
            )}
          </div>

          {/* Backlinks */}
          <div>
            <button
              onClick={() => toggleMenu("Backlinks")}
              className="w-full px-6 py-3 text-left font-medium transition-colors flex items-center justify-between text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            >
              Backlinks
              {expandedMenus.includes("Backlinks") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedMenus.includes("Backlinks") && (
              <div className="bg-[#0a0a0a]">
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <LinkIcon className="h-4 w-4" />
                  Backlink Research
                </button>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <BarChart3 className="h-4 w-4" />
                  Backlink Monitoring
                </button>
              </div>
            )}
          </div>

          {/* Other Tools */}
          <button
            onClick={() => setActiveMenu("Other Tools")}
            className={`w-full px-6 py-3 text-left font-medium transition-colors ${
              activeMenu === "Other Tools" ? "bg-[#2d3748] text-white" : "text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            }`}
          >
            Other Tools
          </button>

          {/* Account */}
          <div>
            <button
              onClick={() => toggleMenu("Account")}
              className="w-full px-6 py-3 text-left font-medium transition-colors flex items-center justify-between text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            >
              Account
              {expandedMenus.includes("Account") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedMenus.includes("Account") && (
              <div className="bg-[#0a0a0a]">
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  Domain Settings
                </button>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <User className="h-4 w-4" />
                  My Account
                </button>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  Account Users
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Circle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Website URL"
                  className="w-full h-11 bg-gray-50 border-gray-300 rounded-md pl-12 pr-4 text-gray-600"
                />
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 h-11 rounded-md font-medium">
                Quick Audit
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer">
              <span className="font-medium">Help</span>
              <HelpCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="px-8 py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to <span className="relative inline-block text-gray-900">
                SEOptimer
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full"></span>
              </span>
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-16 max-w-3xl mx-auto">
              The dashboard contains links to the most important functions of your plan as well as handy SEOptimer and general{" "}
              <span className="font-bold text-gray-900">SEO resources</span>. Reach out to us on{" "}
              <span className="font-bold text-gray-900">Live Chat</span> if you need help and we'll respond within 24 hours. Get started by running an audit on your or your client's site.
            </p>

            {/* Audits Section */}
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-left">Audits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Run an Audit */}
              <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow text-left">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Run an Audit</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Run a quick one off report on any website or page. Use this to research your competitor's strengths, or review specific pages of your site.
                </p>
              </div>

              {/* Run a White Label Report */}
              <Link href="/white-label-reports">
                <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow text-left cursor-pointer">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6"/>
                      <path d="M16 13H8"/>
                      <path d="M16 17H8"/>
                      <path d="M10 9H8"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Run a White Label Report</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Create Beautiful Branded White Label Reports available in Web or PDF Format. Reports are based on your configured Report Templates.
                  </p>
                </div>
              </Link>

              {/* Configure Report Templates */}
              <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow text-left">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Configure Report Templates</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Configure the look and feel of your reports by uploading a company logo, adding custom text and choosing checks to include etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
