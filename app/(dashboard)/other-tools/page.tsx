"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ChevronRight, ChevronDown, FileText, FileCheck, Globe, ClipboardList, Search, TrendingUp, Link as LinkIcon, BarChart3, Settings, User, Users, LogOut, Circle, HelpCircle, Eye, Wrench, FileCode, Copy, Check } from "lucide-react";

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
  
  // Schema Generator States
  const [showSchemaGenerator, setShowSchemaGenerator] = useState(false);
  const [schemaType, setSchemaType] = useState("LocalBusiness");
  const [schemaSubType, setSchemaSubType] = useState("");
  const [schemaData, setSchemaData] = useState<any>({});
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [copied, setCopied] = useState(false);
  const [openingHours, setOpeningHours] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [open24_7, setOpen24_7] = useState(false);

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

  const updateSchemaData = (key: string, value: any) => {
    setSchemaData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSchemaTypeChange = (type: string) => {
    setSchemaType(type);
    setSchemaSubType("");
    setSchemaData({});
    setOpeningHours([]);
    setDepartments([]);
    setOpen24_7(false);
  };

  const addOpeningHours = () => {
    setOpeningHours([...openingHours, { dayOfWeek: "", opens: "", closes: "" }]);
  };

  const updateOpeningHours = (index: number, field: string, value: string) => {
    const updated = [...openingHours];
    updated[index][field] = value;
    setOpeningHours(updated);
  };

  const removeOpeningHours = (index: number) => {
    setOpeningHours(openingHours.filter((_, i) => i !== index));
  };

  const addDepartment = () => {
    setDepartments([...departments, { name: "", telephone: "" }]);
  };

  const updateDepartment = (index: number, field: string, value: string) => {
    const updated = [...departments];
    updated[index][field] = value;
    setDepartments(updated);
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  // Real-time schema generation
  useEffect(() => {
    if (!showSchemaGenerator) return;

    let schema: any = {
      "@context": "https://schema.org",
      "@type": schemaSubType || schemaType
    };

    switch (schemaType) {
      case "Organization":
        schema = {
          ...schema,
          ...(schemaData.name && { name: schemaData.name }),
          ...(schemaData.url && { url: schemaData.url }),
          ...(schemaData.logo && { logo: schemaData.logo }),
          ...(schemaData.image && { image: schemaData.image }),
          ...(schemaData.id && { "@id": schemaData.id }),
          ...(schemaData.description && { description: schemaData.description }),
          ...(schemaData.contactEmail && {
            contactPoint: {
              "@type": "ContactPoint",
              email: schemaData.contactEmail,
              contactType: "customer service"
            }
          })
        };
        break;

      case "Article":
        schema = {
          ...schema,
          ...(schemaData.headline && { headline: schemaData.headline }),
          ...(schemaData.description && { description: schemaData.description }),
          ...(schemaData.authorName && {
            author: {
              "@type": "Person",
              name: schemaData.authorName
            }
          }),
          ...(schemaData.datePublished && { datePublished: schemaData.datePublished }),
          ...(schemaData.dateModified && { dateModified: schemaData.dateModified }),
          ...(schemaData.image && { image: schemaData.image }),
          ...(schemaData.id && { "@id": schemaData.id })
        };
        break;

      case "Product":
        schema = {
          ...schema,
          ...(schemaData.name && { name: schemaData.name }),
          ...(schemaData.description && { description: schemaData.description }),
          ...(schemaData.image && { image: schemaData.image }),
          ...(schemaData.id && { "@id": schemaData.id }),
          ...(schemaData.brand && { brand: { "@type": "Brand", name: schemaData.brand } }),
          ...(schemaData.sku && { sku: schemaData.sku }),
          ...((schemaData.price || schemaData.priceRange) && {
            offers: {
              "@type": "Offer",
              ...(schemaData.price && { price: schemaData.price }),
              ...(schemaData.priceRange && { priceRange: schemaData.priceRange }),
              priceCurrency: schemaData.currency || "USD",
              ...(schemaData.availability && { availability: schemaData.availability })
            }
          })
        };
        break;

      case "LocalBusiness":
        const addressFields = {
          "@type": "PostalAddress",
          ...(schemaData.streetAddress && { streetAddress: schemaData.streetAddress }),
          ...(schemaData.city && { addressLocality: schemaData.city }),
          ...(schemaData.state && { addressRegion: schemaData.state }),
          ...(schemaData.postalCode && { postalCode: schemaData.postalCode }),
          ...(schemaData.country && { addressCountry: schemaData.country })
        };

        const hasAddress = schemaData.streetAddress || schemaData.city || schemaData.state || schemaData.postalCode || schemaData.country;

        const geoFields = {
          "@type": "GeoCoordinates",
          ...(schemaData.latitude && { latitude: schemaData.latitude }),
          ...(schemaData.longitude && { longitude: schemaData.longitude })
        };

        const hasGeo = schemaData.latitude && schemaData.longitude;

        schema = {
          ...schema,
          ...(schemaData.name && { name: schemaData.name }),
          ...(schemaData.image && { image: schemaData.image }),
          ...(schemaData.id && { "@id": schemaData.id }),
          ...(schemaData.url && { url: schemaData.url }),
          ...(schemaData.telephone && { telephone: schemaData.telephone }),
          ...(schemaData.priceRange && { priceRange: schemaData.priceRange }),
          ...(hasAddress && { address: addressFields }),
          ...(hasGeo && { geo: geoFields }),
          ...(openingHours.length > 0 && !open24_7 && {
            openingHoursSpecification: openingHours
              .filter(oh => oh.dayOfWeek && oh.opens && oh.closes)
              .map(oh => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: oh.dayOfWeek,
                opens: oh.opens,
                closes: oh.closes
              }))
          }),
          ...(open24_7 && { openingHours: "24/7" }),
          ...(departments.length > 0 && {
            department: departments
              .filter(dept => dept.name)
              .map(dept => ({
                "@type": "Organization",
                name: dept.name,
                ...(dept.telephone && { telephone: dept.telephone })
              }))
          })
        };
        break;

      case "Person":
        schema = {
          ...schema,
          ...(schemaData.name && { name: schemaData.name }),
          ...(schemaData.url && { url: schemaData.url }),
          ...(schemaData.image && { image: schemaData.image }),
          ...(schemaData.jobTitle && { jobTitle: schemaData.jobTitle }),
          ...(schemaData.worksFor && {
            worksFor: {
              "@type": "Organization",
              name: schemaData.worksFor
            }
          }),
          ...(schemaData.sameAs && schemaData.sameAs.length > 0 && {
            sameAs: schemaData.sameAs
          })
        };
        break;

      case "FAQPage":
        const faqEntries = schemaData.faqs
          ? schemaData.faqs.split("\n\n").map((faq: string) => {
              const [question, answer] = faq.split("\n");
              return {
                "@type": "Question",
                name: question?.replace(/^Q:\s*/, "") || "",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: answer?.replace(/^A:\s*/, "") || ""
                }
              };
            })
          : [];

        schema = {
          ...schema,
          ...(faqEntries.length > 0 && { mainEntity: faqEntries })
        };
        break;
    }

    // Remove empty objects and arrays
    Object.keys(schema).forEach(key => {
      if (typeof schema[key] === 'object' && schema[key] !== null && !Array.isArray(schema[key])) {
        if (Object.keys(schema[key]).length === 1 && schema[key]["@type"]) {
          delete schema[key];
        }
      }
      if (Array.isArray(schema[key]) && schema[key].length === 0) {
        delete schema[key];
      }
    });

    setGeneratedSchema(JSON.stringify(schema, null, 2));
  }, [schemaType, schemaSubType, schemaData, openingHours, departments, open24_7, showSchemaGenerator]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(generatedSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSubTypes = (type: string) => {
    switch (type) {
      case "LocalBusiness":
        return [
          "AnimalShelter", "ArchiveOrganization", "AutomotiveBusiness", "ChildCare", 
          "Dentist", "DryCleaningOrLaundry", "EmergencyService", "EmploymentAgency",
          "EntertainmentBusiness", "FinancialService", "FoodEstablishment", "GovernmentOffice",
          "HealthAndBeautyBusiness", "HomeAndConstructionBusiness", "InternetCafe",
          "LegalService", "Library", "LodgingBusiness", "MedicalBusiness", "ProfessionalService",
          "RadioStation", "RealEstateAgent", "RecyclingCenter", "SelfStorage", "ShoppingCenter",
          "SportsActivityLocation", "Store", "TelevisionStation", "TouristInformationCenter",
          "TravelAgency"
        ];
      case "Organization":
        return [
          "Airline", "Consortium", "Corporation", "EducationalOrganization", "FundingScheme",
          "GovernmentOrganization", "LibrarySystem", "LocalBusiness", "MedicalOrganization",
          "NGO", "NewsMediaOrganization", "PerformingGroup", "Project", "ResearchOrganization",
          "SportsOrganization", "WorkersUnion"
        ];
      case "Article":
        return [
          "AdvertiserContentArticle", "NewsArticle", "Report", "SatiricalArticle",
          "ScholarlyArticle", "SocialMediaPosting", "TechArticle"
        ];
      default:
        return [];
    }
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
      // Call Next.js API route (server-side proxy) instead of backend directly
      // This avoids mixed content errors (HTTPS → HTTP)
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: altTagUrl })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      // Transform SEO analyzer response to match expected format
      const transformedData = {
        success: true,
        url: data.data.url,
        statistics: {
          totalImages: data.data.images.total,
          relevantImages: data.data.images.total,
          imagesWithAlt: data.data.images.withAlt,
          imagesWithoutAlt: data.data.images.withoutAlt,
          altCoverage: data.data.images.altPercentage
        },
        images: {
          all: data.data.images.all || [],
          withAlt: data.data.images.withAltList || [],
          withoutAlt: data.data.images.withoutAltList || []
        }
      };

      setResults(transformedData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking alt tags');
      console.error('[Alt Tag Checker Error]:', err);
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
        {!showAltTagChecker && !showSchemaGenerator ? (
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

              {/* Generators Section */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Generators</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Schema Markup Generator */}
                  <div 
                    onClick={() => setShowSchemaGenerator(true)}
                    className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                      <FileCode className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Schema Markup Generator</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Generate structured data (JSON-LD) for your website to help search engines understand your content better.
                    </p>
                  </div>
                </div>
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
        ) : showSchemaGenerator ? (
          <div className="bg-gray-50 min-h-screen">
            <div className="px-8 py-6 bg-white border-b border-gray-200">
              {/* Back to Tools Button */}
              <button 
                onClick={() => setShowSchemaGenerator(false)}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6 font-medium"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to Tools
              </button>

              {/* Tool Header */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Schema Markup Generator (JSON-LD)
              </h1>
              <p className="text-gray-600">
                Generate structured data markup for your website to help search engines better understand your content.
              </p>
            </div>

            {/* Split Layout: Form Left, JSON Preview Right */}
            <div className="flex h-[calc(100vh-200px)]">
              {/* Left Side: Form */}
              <div className="w-1/2 overflow-y-auto p-8 bg-white border-r border-gray-200">
                {/* Schema Type Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {schemaType} @type
                  </label>
                  <select
                    value={schemaType}
                    onChange={(e) => handleSchemaTypeChange(e.target.value)}
                    className="w-full h-10 border border-gray-600 rounded bg-gray-800 text-white px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="LocalBusiness">LocalBusiness</option>
                    <option value="Organization">Organization</option>
                    <option value="Person">Person</option>
                    <option value="Article">Article</option>
                    <option value="Product">Product</option>
                    <option value="FAQPage">FAQPage</option>
                  </select>
                </div>

                {/* More Specific @type */}
                {getSubTypes(schemaType).length > 0 && (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      More specific @type
                    </label>
                    <select
                      value={schemaSubType}
                      onChange={(e) => setSchemaSubType(e.target.value)}
                      className="w-full h-10 border border-gray-600 rounded bg-gray-800 text-white px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a more specific type (optional)</option>
                      {getSubTypes(schemaType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Common Fields for All Types */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                    <Input
                      type="text"
                      placeholder="Enter name"
                      value={schemaData.name || ""}
                      onChange={(e) => updateSchemaData("name", e.target.value)}
                      className="w-full h-10"
                    />
                  </div>

                  {schemaType !== "FAQPage" && schemaType !== "Article" && schemaType !== "Person" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Image URL</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={schemaData.image || ""}
                          onChange={(e) => updateSchemaData("image", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">@id (URL)</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/#organization"
                          value={schemaData.id || ""}
                          onChange={(e) => updateSchemaData("id", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </>
                  )}

                  {(schemaType === "Organization" || schemaType === "LocalBusiness") && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">URL</label>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={schemaData.url || ""}
                          onChange={(e) => updateSchemaData("url", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
                        <Input
                          type="tel"
                          placeholder="+1-555-555-5555"
                          value={schemaData.telephone || ""}
                          onChange={(e) => updateSchemaData("telephone", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </>
                  )}

                  {schemaType === "LocalBusiness" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Price range</label>
                        <Input
                          type="text"
                          placeholder="$$"
                          value={schemaData.priceRange || ""}
                          onChange={(e) => updateSchemaData("priceRange", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-gray-700 font-medium mb-3">Address</h3>
                        <div className="space-y-3">
                          <Input
                            type="text"
                            placeholder="Street"
                            value={schemaData.streetAddress || ""}
                            onChange={(e) => updateSchemaData("streetAddress", e.target.value)}
                            className="w-full h-10"
                          />
                          <Input
                            type="text"
                            placeholder="City"
                            value={schemaData.city || ""}
                            onChange={(e) => updateSchemaData("city", e.target.value)}
                            className="w-full h-10"
                          />
                          <Input
                            type="text"
                            placeholder="Zip code"
                            value={schemaData.postalCode || ""}
                            onChange={(e) => updateSchemaData("postalCode", e.target.value)}
                            className="w-full h-10"
                          />
                          <select
                            value={schemaData.country || ""}
                            onChange={(e) => updateSchemaData("country", e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IT">Italy</option>
                            <option value="ES">Spain</option>
                            <option value="NL">Netherlands</option>
                            <option value="JP">Japan</option>
                            <option value="CN">China</option>
                            <option value="IN">India</option>
                          </select>
                          <Input
                            type="text"
                            placeholder="State/Province/Region"
                            value={schemaData.state || ""}
                            onChange={(e) => updateSchemaData("state", e.target.value)}
                            className="w-full h-10"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-gray-700 font-medium mb-3">Geo Coordinates</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="text"
                            placeholder="Latitude"
                            value={schemaData.latitude || ""}
                            onChange={(e) => updateSchemaData("latitude", e.target.value)}
                            className="w-full h-10"
                          />
                          <Input
                            type="text"
                            placeholder="Longitude"
                            value={schemaData.longitude || ""}
                            onChange={(e) => updateSchemaData("longitude", e.target.value)}
                            className="w-full h-10"
                          />
                        </div>
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          GEO COORDINATES
                        </button>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-700 font-medium">Opening Hours</h3>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={open24_7}
                              onChange={(e) => setOpen24_7(e.target.checked)}
                              className="rounded"
                            />
                            Open 24/7
                          </label>
                        </div>
                        {!open24_7 && (
                          <div className="space-y-3">
                            {openingHours.map((hour, index) => (
                              <div key={index} className="flex gap-2">
                                <select
                                  value={hour.dayOfWeek}
                                  onChange={(e) => updateOpeningHours(index, "dayOfWeek", e.target.value)}
                                  className="flex-1 h-10 border border-gray-300 rounded px-2 text-sm"
                                >
                                  <option value="">Day</option>
                                  <option value="Monday">Monday</option>
                                  <option value="Tuesday">Tuesday</option>
                                  <option value="Wednesday">Wednesday</option>
                                  <option value="Thursday">Thursday</option>
                                  <option value="Friday">Friday</option>
                                  <option value="Saturday">Saturday</option>
                                  <option value="Sunday">Sunday</option>
                                </select>
                                <Input
                                  type="time"
                                  value={hour.opens}
                                  onChange={(e) => updateOpeningHours(index, "opens", e.target.value)}
                                  className="w-24 h-10"
                                />
                                <Input
                                  type="time"
                                  value={hour.closes}
                                  onChange={(e) => updateOpeningHours(index, "closes", e.target.value)}
                                  className="w-24 h-10"
                                />
                                <button
                                  onClick={() => removeOpeningHours(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <Button
                              onClick={addOpeningHours}
                              variant="outline"
                              className="w-full h-10 border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              + ADD OPENING HOURS
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-gray-700 font-medium mb-3">Departments</h3>
                        <div className="space-y-3">
                          {departments.map((dept, index) => (
                            <div key={index} className="space-y-2 p-3 bg-gray-50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Department {index + 1}</span>
                                <button
                                  onClick={() => removeDepartment(index)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <Input
                                type="text"
                                placeholder="Department name"
                                value={dept.name}
                                onChange={(e) => updateDepartment(index, "name", e.target.value)}
                                className="w-full h-10"
                              />
                              <Input
                                type="tel"
                                placeholder="Phone number"
                                value={dept.telephone}
                                onChange={(e) => updateDepartment(index, "telephone", e.target.value)}
                                className="w-full h-10"
                              />
                            </div>
                          ))}
                          <Button
                            onClick={addDepartment}
                            variant="outline"
                            className="w-full h-10 border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            + ADD DEPARTMENT
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {schemaType === "Article" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Headline</label>
                        <Input
                          type="text"
                          placeholder="Article headline"
                          value={schemaData.headline || ""}
                          onChange={(e) => updateSchemaData("headline", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                        <Textarea
                          placeholder="Article description"
                          value={schemaData.description || ""}
                          onChange={(e) => updateSchemaData("description", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Author Name</label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={schemaData.authorName || ""}
                          onChange={(e) => updateSchemaData("authorName", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Date Published</label>
                        <Input
                          type="date"
                          value={schemaData.datePublished || ""}
                          onChange={(e) => updateSchemaData("datePublished", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Image URL</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={schemaData.image || ""}
                          onChange={(e) => updateSchemaData("image", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </>
                  )}

                  {schemaType === "Product" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                        <Textarea
                          placeholder="Product description"
                          value={schemaData.description || ""}
                          onChange={(e) => updateSchemaData("description", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Brand</label>
                        <Input
                          type="text"
                          placeholder="Brand name"
                          value={schemaData.brand || ""}
                          onChange={(e) => updateSchemaData("brand", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">SKU</label>
                        <Input
                          type="text"
                          placeholder="Product SKU"
                          value={schemaData.sku || ""}
                          onChange={(e) => updateSchemaData("sku", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Price</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="99.99"
                          value={schemaData.price || ""}
                          onChange={(e) => updateSchemaData("price", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Currency</label>
                        <Input
                          type="text"
                          placeholder="USD"
                          value={schemaData.currency || "USD"}
                          onChange={(e) => updateSchemaData("currency", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </>
                  )}

                  {schemaType === "Organization" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Logo URL</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={schemaData.logo || ""}
                          onChange={(e) => updateSchemaData("logo", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                        <Textarea
                          placeholder="Organization description"
                          value={schemaData.description || ""}
                          onChange={(e) => updateSchemaData("description", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Contact Email</label>
                        <Input
                          type="email"
                          placeholder="contact@example.com"
                          value={schemaData.contactEmail || ""}
                          onChange={(e) => updateSchemaData("contactEmail", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </>
                  )}

                  {schemaType === "Person" && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">URL</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/person"
                          value={schemaData.url || ""}
                          onChange={(e) => updateSchemaData("url", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Picture URL</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          value={schemaData.image || ""}
                          onChange={(e) => updateSchemaData("image", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Social profiles</label>
                        <select
                          className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                          onChange={(e) => {
                            if (e.target.value) {
                              const currentProfiles = schemaData.sameAs || [];
                              updateSchemaData("sameAs", [...currentProfiles, e.target.value]);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Social profiles</option>
                          <option value="https://facebook.com/">Facebook</option>
                          <option value="https://twitter.com/">Twitter</option>
                          <option value="https://linkedin.com/in/">LinkedIn</option>
                          <option value="https://instagram.com/">Instagram</option>
                          <option value="https://youtube.com/">YouTube</option>
                        </select>
                        {schemaData.sameAs && schemaData.sameAs.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {schemaData.sameAs.map((profile: string, index: number) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  type="url"
                                  value={profile}
                                  onChange={(e) => {
                                    const updated = [...schemaData.sameAs];
                                    updated[index] = e.target.value;
                                    updateSchemaData("sameAs", updated);
                                  }}
                                  className="flex-1 h-10"
                                />
                                <button
                                  onClick={() => {
                                    const updated = schemaData.sameAs.filter((_: any, i: number) => i !== index);
                                    updateSchemaData("sameAs", updated);
                                  }}
                                  className="text-red-500 hover:text-red-700 px-2"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Job title</label>
                        <Input
                          type="text"
                          placeholder="Software Engineer"
                          value={schemaData.jobTitle || ""}
                          onChange={(e) => updateSchemaData("jobTitle", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Company</label>
                        <Input
                          type="text"
                          placeholder="Company Name"
                          value={schemaData.worksFor || ""}
                          onChange={(e) => updateSchemaData("worksFor", e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </>
                  )}

                  {schemaType === "FAQPage" && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        FAQs (Format: Q: Question / A: Answer, separate with double line break)
                      </label>
                      <Textarea
                        placeholder="Q: What is Schema Markup?&#10;A: Schema markup is structured data.&#10;&#10;Q: Why is it important?&#10;A: It helps search engines understand your content."
                        value={schemaData.faqs || ""}
                        onChange={(e) => updateSchemaData("faqs", e.target.value)}
                        className="w-full min-h-48"
                      />
                    </div>
                  )}
                </div>

                {/* Reference Links */}
                <div className="pt-6 mt-6 border-t border-gray-200 flex gap-4 text-sm">
                  <a href="https://schema.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Schema.org's references
                  </a>
                  <a href="https://developers.google.com/search/docs/appearance/structured-data" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google's documentation
                  </a>
                </div>
              </div>

              {/* Right Side: JSON Preview */}
              <div className="w-1/2 bg-gray-900 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-800 rounded">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded">
                      <FileCode className="h-5 w-5 text-gray-400" />
                    </button>
                    <button
                      onClick={handleCopySchema}
                      className="p-2 hover:bg-gray-800 rounded text-red-400"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 text-green-400 font-mono text-sm">
                  <pre className="whitespace-pre-wrap wrap-break-word">
                    <code>
                      {`<script type="application/ld+json">\n${generatedSchema || JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": schemaSubType || schemaType
                      }, null, 2)}\n</script>`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : showAltTagChecker ? (
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
        ) : null}
      </div>
    </div>
  );
}