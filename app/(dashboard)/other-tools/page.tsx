"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronRight, ChevronDown, FileText, FileCheck, Globe, ClipboardList, Search, TrendingUp, Link as LinkIcon, BarChart3, Settings, User, Users, LogOut, Circle, HelpCircle, Eye, Wrench, FileCode } from "lucide-react";

export default function OtherToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Other Tools");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [showAltTagChecker, setShowAltTagChecker] = useState(false);
  const [altTagUrl, setAltTagUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

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

  const handleCheckAltTags = async () => {
    if (!altTagUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setChecking(true);
    setError("");
    setResults(null);
    setShowDetails(false);

    try {
      // Get backend URL from environment or use default
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'your-secret-api-key';

      const response = await fetch(`${backendUrl}/api/check-alt-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ url: altTagUrl })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check alt tags');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking alt tags');
    } finally {
      setChecking(false);
    }
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
          <Link href="/dashboard">
            <button
              className="w-full px-6 py-3 text-left font-medium transition-colors text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
            >
              Dashboard
            </button>
          </Link>

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
            className="w-full px-6 py-3 text-left font-medium transition-colors bg-[#2d3748] text-white"
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

        {/* SEO Tools Section or Individual Tool */}
        {!showAltTagChecker ? (
          <div className="px-8 py-12 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  SEOptimer's Free SEO Tools
                </h1>
                <p className="text-gray-500 text-lg">
                  SEOptimer provides a range of tools to help you improve your website. Try one of our free tools today.
                </p>
              </div>

              {/* Checkers Section */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Checkers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image Alt Tag Checker */}
                  <div 
                    onClick={() => setShowAltTagChecker(true)}
                    className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center mb-6">
                      <svg 
                        className="h-8 w-8 text-green-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Image Alt Tag Checker</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Check if your website images have proper alt attributes. Alt tags are important for accessibility and SEO.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pl-12 pr-8 py-12 bg-white min-h-screen">
            <div className="max-w-5xl">
              {/* Back to Tools Button */}
              <button 
                onClick={() => setShowAltTagChecker(false)}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-8 font-medium"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to Tools
              </button>

              {/* Tool Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Image Alt Tag Checker
                </h1>
                <p className="text-gray-500 text-lg">
                  SEOptimer's Image Alt Tag Checker scans your webpage to ensure all images have properly defined image alt tags.
                </p>
              </div>

              {/* URL Input Section */}
              <div className="mb-12">
                <label className="block text-gray-700 font-medium mb-3">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="Example.com"
                    value={altTagUrl}
                    onChange={(e) => setAltTagUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCheckAltTags()}
                    disabled={checking}
                    className="flex-1 h-12 border-gray-300 rounded-md"
                  />
                  <Button 
                    onClick={handleCheckAltTags}
                    disabled={checking}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 h-12 rounded-md disabled:opacity-50"
                  >
                    {checking ? "Checking..." : "Check"}
                  </Button>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Results Section */}
              {results && (
                <div className="mb-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Result for {new URL(results.url).hostname}
                      </h2>
                      {results.statistics.imagesWithoutAlt > 0 ? (
                        <p className="text-red-600 font-medium">
                          You have images on your page that are missing Alt Attributes.
                        </p>
                      ) : (
                        <p className="text-green-600 font-medium">
                          Great! All images on your page have Alt Attributes.
                        </p>
                      )}
                    </div>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                      results.statistics.imagesWithoutAlt > 0 ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {results.statistics.imagesWithoutAlt > 0 ? (
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    We found <strong>{results.statistics.relevantImages}</strong> images on your page and{" "}
                    <strong className={results.statistics.imagesWithoutAlt > 0 ? "text-red-600" : "text-green-600"}>
                      {results.statistics.imagesWithoutAlt}
                    </strong> of them are missing the attribute.
                  </p>

                  <p className="text-gray-600 mb-6">
                    Alt Attributes are an often overlooked and simple way to signal to Search Engines what an image is about, 
                    and help it rank in image search results.
                  </p>

                  {results.statistics.imagesWithoutAlt > 0 && (
                    <Button
                      onClick={() => setShowDetails(!showDetails)}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </Button>
                  )}

                  {/* Details Section */}
                  {showDetails && results.statistics.imagesWithoutAlt > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-lg mb-3">Images Missing Alt Attributes:</h3>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full bg-white">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">#</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image Link</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {results.images.withoutAlt.map((image: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                                <td className="px-6 py-4 text-sm">
                                  <a 
                                    href={image.src.startsWith('http') ? image.src : `https://${new URL(results.url).hostname}${image.src.startsWith('/') ? '' : '/'}${image.src}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                  >
                                    {image.src}
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* What it is Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What it is</h2>
                <p className="text-gray-600 leading-relaxed">
                  Alternate Image Text or Alt Text is descriptive text that is displayed in place of an image if it can't be loaded, 
                  as well as a label on an image when it is moused over in the browser, to give more information to the visitor. 
                  Additionally, Search Engines use provided Alt Text to better understand the content of an image. Image SEO is not 
                  widely followed, but having your image rank for image searches is an overlooked way of gaining traffic and backlinks 
                  to your site.
                </p>
              </div>

              {/* How to fix it Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to fix it</h2>
                <p className="text-gray-600 leading-relaxed">
                  We recommend adding useful and keyword rich Alt Text for pages's main images, in particular those that could have 
                  ranking potential. This should be considered on a case-by-case basis. Often there may be imagery such as UI components 
                  or tracking pixels where it may not be useful to add Alt Text, though we have tried to filter a number of these out in 
                  our analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
