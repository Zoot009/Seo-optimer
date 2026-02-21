"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Share2,
  Download,
  X,
  Copy,
  Check,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { EditableField, EditableScore } from "@/components/editable-field";

interface ReportData {
  url: string;
  score: number;
  grade: string;
  screenshot?: string;
  screenshotMobile?: string;
  title: string;
  description: string;
  metaTags: {
    hasTitle: boolean;
    titleLength: number;
    hasDescription: boolean;
    descriptionLength: number;
    hasViewport: boolean;
    hasOgTags: boolean;
    hasTwitterCard: boolean;
  };
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    hasH1: boolean;
    h1Text: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    altPercentage: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
    broken: number;
  };
  performance: {
    loadTime: number;
    pageSize: number;
  };
  content: {
    wordCount: number;
    textLength: number;
  };
  technicalSEO: {
    hasRobotsTxt: boolean;
    robotsTxtUrl?: string;
    hasSitemap: boolean;
    sitemapUrl?: string;
    hasSSL: boolean;
    isResponsive: boolean;
    hasAnalytics: boolean;
    hasSchema: boolean;
    hasJsonLd?: boolean;
    schemaTypes: string[];
    hasIdentitySchema: boolean;
    identityType?: string;
    hasLocalBusinessSchema?: boolean;
    renderingPercentage?: number;
    hasMicrodata?: boolean;
    hasRDFa?: boolean;
  };
  onPageSEO: {
    score: number;
    message: string;
    description: string;
  };
  social: {
    score: number;
    message: string;
    description: string;
    hasFacebookPage: boolean;
    facebookUrl?: string;
    hasInstagram: boolean;
    instagramUrl?: string;
    hasTwitter: boolean;
    twitterUrl?: string;
    hasLinkedIn: boolean;
    linkedInUrl?: string;
    hasYouTube: boolean;
    youTubeUrl?: string;
  };
  localSEO: {
    hasLocalBusinessSchema: boolean;
    hasPhone?: boolean;
    phoneNumber?: string;
    hasAddress?: boolean;
    addressText?: string;
  };
  recommendations: Array<{
    title: string;
    category: string;
    priority: string;
  }>;
  manualChecks?: {
    [key: string]: boolean; // true = checkmark, false = cross mark
  };
}

export default function ReportViewPage() {
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [reportMetadata, setReportMetadata] = useState<{ createdAt: string } | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("Initializing...");
  const [pollCount, setPollCount] = useState<number>(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Reset poll count and always trigger reanalysis when viewing a report
    setPollCount(0);
    fetchReport(true, 0);
  }, [params.id]);

  const fetchReport = async (reanalyze = false, currentPollCount = pollCount) => {
    try {
      const token = localStorage.getItem("seomaster_auth_token");
      
      // For initial load or reanalysis, fetch with full data
      // For polling, only check status (statusOnly=true)
      const isPolling = !reanalyze && currentPollCount > 0;
      const url = reanalyze 
        ? `/api/reports/${params.id}?reanalyze=true`
        : isPolling
        ? `/api/reports/${params.id}?statusOnly=true`
        : `/api/reports/${params.id}`;
      
      console.log(`[REPORT PAGE] Fetching report, reanalyze: ${reanalyze}, polling: ${isPolling}, attempt: ${currentPollCount}`);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log(`[REPORT PAGE] Report status: ${data.report.status}`);
        
        if (data.report.status === "completed") {
          // If we only got status, fetch full data now
          if (isPolling) {
            console.log(`[REPORT PAGE] Status is completed, fetching full report data`);
            const fullResponse = await fetch(`/api/reports/${params.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (fullResponse.ok) {
              const fullData = await fullResponse.json();
              if (fullData.report.reportData) {
                setReport(fullData.report.reportData);
                setReportMetadata({ createdAt: fullData.report.createdAt });
                setStatus("completed");
                console.log(`[REPORT PAGE] Full report loaded and displayed`);
              }
            }
          } else if (data.report.reportData) {
            // We already have full data
            console.log(`[REPORT PAGE] Report completed, displaying results`);
            setReport(data.report.reportData);
            setReportMetadata({ createdAt: data.report.createdAt });
            setStatus("completed");
          }
        } else if (data.report.status === "processing" || data.report.status === "pending") {
          // Update status
          setStatus(data.report.status);
          if (data.report.status === "processing") {
            setProgress("Analyzing website... This may take a minute.");
          } else {
            setProgress("Starting analysis...");
          }
          
          // Check if we've exceeded max polling attempts (60 attempts = 2 minutes)
          const newPollCount = currentPollCount + 1;
          setPollCount(newPollCount);
          
          if (newPollCount > 60) {
            console.error(`[REPORT PAGE] Max polling attempts reached (${newPollCount})`);
            setStatus("failed");
            setError("Report generation is taking too long. Please try again later.");
            toast.error("Report generation timeout. Please try again.");
            return;
          }
          
          // Silent polling - check again in 2 seconds with updated count
          console.log(`[REPORT PAGE] Status: ${data.report.status}, polling again in 2s (attempt ${newPollCount}/60)`);
          setTimeout(() => fetchReport(false, newPollCount), 2000);
        } else if (data.report.status === "failed") {
          console.error(`[REPORT PAGE] Report failed`);
          setStatus("failed");
          setError("Report generation failed");
          toast.error("Report generation failed.");
        }
      } else {
        console.error(`[REPORT PAGE] Failed to fetch report, status: ${response.status}`);
        setError("Failed to load report");
        toast.error("Failed to load report");
      }
    } catch (error) {
      console.error("[REPORT PAGE] Error fetching report:", error);
      setError("An error occurred while loading the report");
      toast.error("Failed to load report");
    }
  };

  const getHostname = (url: string): string => {
    try {
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      return new URL(urlWithProtocol).hostname;
    } catch {
      return url;
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => router.push("/white-label-reports")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  // Show nothing while loading - blank page until report is ready
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Animated Logo/Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Loading Spinner */}
          <div className="mb-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {status === "processing" ? "Analyzing Website" : "Generating Report"}
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            {progress}
          </p>
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          <p className="text-sm text-gray-500">
            This usually takes 30-60 seconds. Please wait...
          </p>
        </div>
      </div>
    );
  }

  // Provide defaults for missing data
  const safeReport = {
    ...report,
    metaTags: report.metaTags || {
      hasTitle: false,
      titleLength: 0,
      hasDescription: false,
      descriptionLength: 0,
      hasViewport: false,
      hasOgTags: false,
      hasTwitterCard: false,
    },
    headings: report.headings || {
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      h4Count: 0,
      h5Count: 0,
      h6Count: 0,
      hasH1: false,
      h1Text: [],
    },
    images: report.images || {
      total: 0,
      withAlt: 0,
      withoutAlt: 0,
      altPercentage: 0,
    },
    links: report.links || {
      total: 0,
      internal: 0,
      external: 0,
      broken: 0,
    },
    performance: report.performance || {
      loadTime: 0,
      pageSize: 0,
    },
    content: report.content || {
      wordCount: 0,
      textLength: 0,
    },
    technicalSEO: report.technicalSEO || {
      hasRobotsTxt: false,
      hasSitemap: false,
      hasSSL: false,
      isResponsive: false,
      hasAnalytics: false,
      hasSchema: false,
      schemaTypes: [],
      hasIdentitySchema: false,
      renderingPercentage: 0,
      hasMicrodata: false,
      hasRDFa: false,
    },
    onPageSEO: report.onPageSEO || {
      score: 0,
      message: "No On-Page SEO data available",
      description: "",
    },
    social: report.social || {
      score: 0,
      message: "Your social needs improvement",
      description: "",
      hasFacebookPage: false,
      hasInstagram: false,
      hasTwitter: false,
      hasLinkedIn: false,
      hasYouTube: false,
    },
    localSEO: report.localSEO || {
      hasLocalBusinessSchema: false,
    },
    recommendations: report.recommendations || [],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    return "text-red-600";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-blue-500";
    return "stroke-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Your page is excellent!";
    if (score >= 80) return "Your page is very good!";
    if (score >= 70) return "Your page is good!";
    if (score >= 60) return "Your page needs improvement";
    return "Your page needs significant work";
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/shared/${params.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...");
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6478";
      const backendApiKey = process.env.NEXT_PUBLIC_API_KEY;
      
      const response = await fetch(`${backendUrl}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': backendApiKey || '',
        },
        body: JSON.stringify({
          reportData: safeReport
        }),
      });

      if (!response.ok) {
        // Try to get error message from JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate PDF');
        }
        throw new Error(`Failed to generate PDF (${response.status})`);
      }

      // Verify content type is PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Invalid content type:', contentType);
        throw new Error('Server did not return a PDF file');
      }

      // Get PDF blob
      const blob = await response.blob();
      console.log('PDF blob size:', blob.size, 'bytes');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-report-${getHostname(safeReport.url)}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };

  const handleSaveChanges = async () => {
    if (!report || !params.id) return;

    try {
      setSaving(true);
      toast.loading("Saving changes...");

      const token = localStorage.getItem("seomaster_auth_token");
      const response = await fetch(`/api/reports/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportData: report,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      toast.dismiss();
      toast.success("Changes saved successfully!");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.dismiss();
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const updateReportField = (path: string[], value: any) => {
    if (!report) return;

    const newReport = JSON.parse(JSON.stringify(report));
    let current = newReport;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setReport(newReport);
    setHasUnsavedChanges(true);
  };

  const removeRecommendation = (index: number) => {
    if (!report) return;
    const newRecommendations = report.recommendations.filter((_, i) => i !== index);
    updateReportField(["recommendations"], newRecommendations);
  };

  const addRecommendation = () => {
    if (!report) return;
    const newRec = {
      title: "New recommendation",
      category: "On-Page SEO",
      priority: "High",
    };
    const newRecommendations = [...report.recommendations, newRec];
    updateReportField(["recommendations"], newRecommendations);
  };

  const updateRecommendation = (index: number, field: string, value: string) => {
    if (!report) return;
    const newRecommendations = [...report.recommendations];
    newRecommendations[index] = { ...newRecommendations[index], [field]: value };
    updateReportField(["recommendations"], newRecommendations);
  };

  // Helper function to check if a recommendation exists for a specific section
  const hasRecommendationFor = (sectionKeywords: string[]): boolean => {
    if (!report) return false;
    return report.recommendations.some(rec =>
      sectionKeywords.some(keyword =>
        rec.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // Toggle manual check status for a section
  const toggleManualCheck = (sectionKey: string) => {
    if (!report) return;
    
    const currentManualChecks = report.manualChecks || {};
    const currentValue = currentManualChecks[sectionKey];
    
    // Toggle: undefined -> true -> false -> undefined (cycle through states)
    let newValue: boolean | undefined;
    if (currentValue === undefined) {
      newValue = true; // Set to checkmark
    } else if (currentValue === true) {
      newValue = false; // Set to cross mark
    } else {
      newValue = undefined; // Remove override, use auto logic
    }
    
    const newManualChecks = { ...currentManualChecks };
    if (newValue === undefined) {
      delete newManualChecks[sectionKey];
    } else {
      newManualChecks[sectionKey] = newValue;
    }
    
    updateReportField(["manualChecks"], newManualChecks);
  };

  // Get the check status (true = checkmark, false = cross mark)
  const getCheckStatus = (sectionKey: string, keywords: string[]): boolean => {
    if (!report) return true;
    
    // Check if there's a manual override first
    if (report.manualChecks && report.manualChecks[sectionKey] !== undefined) {
      return report.manualChecks[sectionKey];
    }
    
    // Fall back to recommendation-based logic
    return !hasRecommendationFor(keywords);
  };

  // Get indicator for manual override state
  const getManualOverrideIndicator = (sectionKey: string): string => {
    if (!report || !report.manualChecks || report.manualChecks[sectionKey] === undefined) {
      return ""; // No manual override
    }
    return " 🔒"; // Manual override active
  };

  // Render clickable checkmark/cross mark
  const renderCheckMark = (sectionKey: string, keywords: string[]) => {
    const isChecked = getCheckStatus(sectionKey, keywords);
    const hasManualOverride = report?.manualChecks?.[sectionKey] !== undefined;
    
    return (
      <span
        className={`text-3xl font-bold cursor-pointer hover:scale-110 transition-transform select-none ${
          isChecked ? "text-green-500" : "text-red-500"
        } ${hasManualOverride ? "opacity-100" : ""}`}
        onClick={() => toggleManualCheck(sectionKey)}
        title={
          hasManualOverride
            ? `Manual override active (${isChecked ? "✓" : "✗"}). Click to cycle: ✓ → ✗ → Auto`
            : "Click to manually set. Cycles: Auto → ✓ → ✗ → Auto"
        }
      >
        {isChecked ? "✓" : "✗"}
      </span>
    );
  };

  // Check if section has manual override
  const hasManualOverride = (sectionKey: string): boolean => {
    return report?.manualChecks?.[sectionKey] !== undefined;
  };

  // Dynamic content generators based on checkmark status
  const getTitleTagContent = () => {
    const isChecked = getCheckStatus("titleTag", ["title tag", "title"]);
    if (isChecked) {
      return safeReport.metaTags.titleLength >= 50 && safeReport.metaTags.titleLength <= 60
        ? "You have a Title Tag of optimal length (between 50 and 60 characters)."
        : safeReport.metaTags.titleLength < 50
        ? "You have a Title Tag, but ideally it should be lengthened to between 50 and 60 characters (including spaces)."
        : "You have a Title Tag, but ideally it should be shortened to between 50 and 60 characters (including spaces).";
    }
    return "Your page does not have a Title Tag.";
  };

  const getMetaDescriptionContent = () => {
    const isChecked = getCheckStatus("metaDescription", ["meta description", "description tag"]);
    if (isChecked) {
      return safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160
        ? "You have a Meta Description Tag of optimal length (between 120 and 160 characters)."
        : safeReport.metaTags.descriptionLength < 120
        ? "Your page has a Meta Description Tag however, your Meta Description should ideally be lengthened to between 120 and 160 characters (including spaces)."
        : "Your page has a Meta Description Tag however, your Meta Description should ideally be shortened to between 120 and 160 characters (including spaces).";
    }
    return "Your page does not have a Meta Description Tag.";
  };

  const getH1HeaderContent = () => {
    const isChecked = getCheckStatus("h1Header", ["h1", "h1 tag", "h1 header"]);
    if (isChecked) {
      return safeReport.headings.h1Count === 1
        ? "Your page has a H1 Tag."
        : "Your page has more than one H1 Tag. It is generally recommended to only use one H1 Tag on a page.";
    }
    return "Your page is missing an H1 Tag.";
  };

  const getH2H6HeaderContent = () => {
    const isChecked = getCheckStatus("h2h6Headers", ["h2", "h3", "h4", "h5", "h6", "header tag"]);
    return isChecked
      ? "Your page is making use of multiple levels of Header Tags (which is good)."
      : "Your page should use multiple levels of Header Tags, such as H2 and H3.";
  };

  const getImageAltContent = () => {
    const isChecked = getCheckStatus("imageAlt", ["image alt", "alt attribute", "alt text"]);
    return isChecked
      ? "You do not have any images missing Alt Attributes on your page."
      : "You have images on your page that are missing Alt Attributes.";
  };

  const getSSLContent = () => {
    const isChecked = getCheckStatus("ssl", ["ssl", "https", "secure"]);
    return isChecked
      ? "Your website has SSL enabled."
      : "Your website does not have SSL enabled.";
  };

  const getRobotsTxtContent = () => {
    const isChecked = getCheckStatus("robotsTxt", ["robots.txt", "robots"]);
    return isChecked
      ? "Your website appears to have a robots.txt file."
      : "Your website does not appear to have a robots.txt file.";
  };

  const getSitemapContent = () => {
    const isChecked = getCheckStatus("sitemap", ["sitemap", "xml sitemap"]);
    return isChecked
      ? "Your website appears to have an XML Sitemap."
      : "Your website does not appear to have an XML Sitemap.";
  };

  const getAnalyticsContent = () => {
    const isChecked = getCheckStatus("analytics", ["analytics", "google analytics"]);
    return isChecked
      ? "We detected an analytics tool installed on your page."
      : "We could not detect an analytics tool installed on your page.";
  };

  const getSchemaContent = () => {
    const isChecked = getCheckStatus("schema", ["schema", "structured data", "json-ld"]);
    return isChecked
      ? "You are using JSON-LD Schema on your page."
      : "Your page is not using JSON-LD Schema.";
  };

  const getIdentitySchemaContent = () => {
    const isChecked = getCheckStatus("identitySchema", ["identity schema", "organization schema", "person schema"]);
    return isChecked
      ? "Organization or Person Schema identified on the page."
      : "No Organization or Person Schema identified on the page.";
  };

  const getFacebookContent = () => {
    const isChecked = getCheckStatus("facebook", ["facebook", "facebook page"]);
    return isChecked
      ? "We found a linked Facebook Page on your website."
      : "We did not detect a Facebook Page linked to your website.";
  };

  const getInstagramContent = () => {
    const isChecked = getCheckStatus("instagram", ["instagram", "instagram account"]);
    return isChecked
      ? "We found a linked Instagram account on your website."
      : "We did not detect an Instagram account linked to your website.";
  };

  const getAddressPhoneContent = () => {
    const isChecked = getCheckStatus("addressPhone", ["address", "phone", "contact"]);
    if (isChecked) {
      return "We detected both an address and phone number on your website.";
    }
    return "We did not detect an address or phone number on your website.";
  };

  const getLocalBusinessSchemaContent = () => {
    const isChecked = getCheckStatus("localBusinessSchema", ["local business schema", "local schema"]);
    return isChecked
      ? "LocalBusiness Schema was found on your website."
      : "We could not find LocalBusiness Schema on your website.";
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeReport.score / 100) * circumference;

  return (
    <div ref={reportRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2c3e50] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/white-label-reports">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Options
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Edit Mode Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 mb-2">
              <span className="font-semibold">Edit Mode Enabled:</span> Double-click on any score, title, description, or text field to edit it. 
              Click the <span className="font-semibold">"Save Changes"</span> button when you're done editing.
            </p>
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Manual Checkmarks:</span> Click any checkmark (✓) or cross mark (✗) to toggle its status. 
              Click multiple times to cycle: Auto → ✓ → ✗ → Auto. 
              Manual overrides are shown with 🔒.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Website Report for{" "}
            <a
              href={safeReport.url.startsWith('http') ? safeReport.url : `https://${safeReport.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {getHostname(safeReport.url)}
            </a>
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            This report grades your website on the strength of a range of
            important factors such as on-page SEO optimization, off-page
            backlinks, social, performance, security and more. The overall
            grade is on a A+ to F- scale, with most major industry leading
            websites in the A range. Improving a website's grade is
            recommended to ensure a better website experience for your users
            and improved ranking and visibility by search engines.
          </p>
        </div>

        {/* Audit Results */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Audit Results for{" "}
            <a
              href={safeReport.url.startsWith('http') ? safeReport.url : `https://${safeReport.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {getHostname(safeReport.url)}
            </a>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    className={getScoreRingColor(safeReport.score)}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-6xl font-bold ${getScoreColor(
                        safeReport.score
                      )}`}
                    >
                      <EditableScore
                        score={safeReport.score}
                        onSave={(newScore) => updateReportField(["score"], newScore)}
                        className="inline-block"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 font-medium mt-4 text-lg">
                {getScoreMessage(safeReport.score)}
              </p>
              <button
                onClick={() => {
                  const element = document.getElementById('recommendations-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`mt-3 inline-block px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  safeReport.recommendations.length > 0
                    ? "bg-pink-50 text-pink-600 hover:bg-pink-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                <span className="font-semibold">
                  {safeReport.recommendations.length > 0
                    ? `Recommendations: ${safeReport.recommendations.length}`
                    : "No issues found! ✓"}
                </span>
              </button>

              {/* Category Scores */}
              <div className="mt-8 grid grid-cols-2 gap-6 w-full max-w-md">
                {/* On-Page SEO */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className={getScoreRingColor(safeReport.onPageSEO.score)}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (safeReport.onPageSEO.score / 100) * 251.2}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-2xl font-bold ${getScoreColor(safeReport.onPageSEO.score)}`}>
                        <EditableScore
                          score={safeReport.onPageSEO.score}
                          onSave={(newScore) => updateReportField(["onPageSEO", "score"], newScore)}
                          className="inline-block"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mt-2">On-Page SEO</p>
                </div>

                {/* Social */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className={safeReport.social.score === 0 ? "stroke-gray-300" : getScoreRingColor(safeReport.social.score)}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (safeReport.social.score / 100) * 251.2}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-2xl font-bold ${safeReport.social.score === 0 ? "text-gray-400" : getScoreColor(safeReport.social.score)}`}>
                        <EditableScore
                          score={safeReport.social.score}
                          onSave={(newScore) => updateReportField(["social", "score"], newScore)}
                          className="inline-block"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mt-2">Social</p>
                </div>
              </div>

              {/* Report Generated Timestamp */}
              <p className="text-sm text-gray-500 mt-6">
                Report Generated: {reportMetadata?.createdAt ? new Date(reportMetadata.createdAt).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'long', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }) : ''} UTC
              </p>
            </div>

            {/* Screenshots - Desktop and Mobile */}
            <div className="flex items-center justify-center">
              {safeReport.screenshot ? (
                <div className="relative w-full max-w-2xl">
                  {/* Desktop View */}
                  <div className="relative border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white">
                    <img
                      src={safeReport.screenshot}
                      alt={`Desktop screenshot of ${safeReport.url}`}
                      className="w-full h-auto"
                    />
                  </div>
                  {/* Mobile View - Overlapping */}
                  {safeReport.screenshotMobile && (
                    <div className="absolute -bottom-8 -right-4 w-48 border-4 border-gray-200 rounded-xl overflow-hidden shadow-2xl bg-white z-10">
                      <div className="bg-white p-1">
                        <img
                          src={safeReport.screenshotMobile}
                          alt={`Mobile screenshot of ${safeReport.url}`}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">No screenshot available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add extra spacing for overlapping mobile view */}
        <div className="mb-12"></div>

        {/* Recommendations Section */}
        <div id="recommendations-section" className="bg-white rounded-lg p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recommendations ({safeReport.recommendations.length})
            </h2>
            <Button
              onClick={addRecommendation}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recommendation
            </Button>
          </div>

          {safeReport.recommendations.length > 0 ? (
            <div className="space-y-1">
              {safeReport.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 group">
                  <div className="flex-1 mr-4">
                    <div className="mb-2">
                      <EditableField
                        value={rec.title}
                        onSave={(newValue) => updateRecommendation(index, "title", String(newValue))}
                        displayClassName="font-medium text-gray-900"
                        placeholder="Recommendation title"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="min-w-30">
                      <EditableField
                        value={rec.category}
                        onSave={(newValue) => updateRecommendation(index, "category", String(newValue))}
                        displayClassName="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm inline-block"
                        placeholder="Category"
                      />
                    </div>
                    <div className="min-w-20">
                      <EditableField
                        value={rec.priority}
                        onSave={(newValue) => updateRecommendation(index, "priority", String(newValue))}
                        displayClassName="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium inline-block"
                        placeholder="Priority"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecommendation(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Remove recommendation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recommendations yet. Click "Add Recommendation" to create one.</p>
            </div>
          )}
        </div>

        {/* On-Page SEO Results Section */}
        <div className="bg-white rounded-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            On-Page SEO Results
          </h2>

          {/* Score and Message */}
          <div className="flex items-start gap-8 mb-8">
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={getScoreRingColor(safeReport.onPageSEO.score)}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={439.6}
                  strokeDashoffset={439.6 - (safeReport.onPageSEO.score / 100) * 439.6}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-5xl font-bold ${getScoreColor(safeReport.onPageSEO.score)}`}>
                  <EditableScore
                    score={safeReport.onPageSEO.score}
                    onSave={(newScore) => updateReportField(["onPageSEO", "score"], newScore)}
                    className="inline-block"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                <EditableField
                  value={safeReport.onPageSEO.message}
                  onSave={(newValue) => updateReportField(["onPageSEO", "message"], newValue)}
                  displayClassName="text-2xl font-semibold text-gray-900"
                />
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <EditableField
                  value={safeReport.onPageSEO.description}
                  onSave={(newValue) => updateReportField(["onPageSEO", "description"], newValue)}
                  multiline={true}
                  displayClassName="text-gray-600 leading-relaxed"
                />
              </p>
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="space-y-6">
            {/* Title Tag */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Title Tag
                  {hasManualOverride("titleTag") && <span className="ml-2 text-xs text-gray-500" title="Manual override active">🔒</span>}
                </h4>
                {renderCheckMark("titleTag", ["title tag", "title"])}
              </div>
              <p className="text-gray-600 mb-3">
                {getTitleTagContent()}
              </p>
              {safeReport.title && (
                <div className="bg-gray-50 p-4 rounded mb-3">
                  <p className="text-gray-800">
                    <EditableField
                      value={safeReport.title}
                      onSave={(newValue) => {
                        updateReportField(["title"], newValue);
                        updateReportField(["metaTags", "titleLength"], String(newValue).length);
                      }}
                      displayClassName="text-gray-800"
                    />
                  </p>
                  <p className="text-gray-500 text-sm mt-2">Length : {safeReport.metaTags.titleLength}</p>
                </div>
              )}
              <p className="text-gray-600 text-sm">
                Title Tags are very important for search engines to correctly understand and categorize your content.
              </p>
            </div>

            {/* Meta Description */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Meta Description Tag
                  {hasManualOverride("metaDescription") && <span className="ml-2 text-xs text-gray-500" title="Manual override active">🔒</span>}
                </h4>
                {renderCheckMark("metaDescription", ["meta description", "description tag"])}
              </div>
              <p className="text-gray-600 mb-3">
                {getMetaDescriptionContent()}
              </p>
              {safeReport.description && (
                <div className="bg-gray-50 p-4 rounded mb-3">
                  <p className="text-gray-800">
                    <EditableField
                      value={safeReport.description}
                      onSave={(newValue) => {
                        updateReportField(["description"], newValue);
                        updateReportField(["metaTags", "descriptionLength"], String(newValue).length);
                      }}
                      multiline={true}
                      displayClassName="text-gray-800"
                    />
                  </p>
                  <p className="text-gray-500 text-sm mt-2">Length : {safeReport.metaTags.descriptionLength}</p>
                </div>
              )}
              <p className="text-gray-600 text-sm">
                A Meta Description is important for search engines to understand the content of your page, and is often shown as the description text blurb in search results.
              </p>
            </div>

            {/* H1 Header */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">
                  H1 Header Tag Usage
                  {hasManualOverride("h1Header") && <span className="ml-2 text-xs text-gray-500" title="Manual override active">🔒</span>}
                </h4>
                {renderCheckMark("h1Header", ["h1", "h1 tag", "h1 header"])}
              </div>
              <p className="text-gray-600 mb-2">
                {getH1HeaderContent()}
              </p>
              <p className="text-gray-500 text-sm">
                The H1 Header Tag is an important way of signaling to search engines what your content is about, and subsequently the keywords it should rank for.
              </p>
            </div>

            {/* H2-H6 Headers */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">H2-H6 Header Tag Usage</h4>
                {renderCheckMark("h2h6Headers", ["h2", "h3", "h4", "h5", "h6", "header tag"])}
              </div>
              <p className="text-gray-600 mb-4">
                {getH2H6HeaderContent()}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                When HTML Heading Tags are used properly, they help search engines better understand the structure and context of your web page.
              </p>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 mb-3">
                  <div className="col-span-2">HEADER TAG</div>
                  <div className="col-span-2">FREQUENCY</div>
                  <div className="col-span-8"></div>
                </div>
                {[
                  { tag: "H2", count: safeReport.headings.h2Count },
                  { tag: "H3", count: safeReport.headings.h3Count },
                  { tag: "H4", count: safeReport.headings.h4Count },
                  { tag: "H5", count: safeReport.headings.h5Count },
                  { tag: "H6", count: safeReport.headings.h6Count },
                ].map((heading) => (
                  <div key={heading.tag} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 text-gray-600 font-medium">{heading.tag}</div>
                    <div className="col-span-2 text-gray-800">{heading.count}</div>
                    <div className="col-span-8">
                      {heading.count > 0 && (
                        <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.min((heading.count / 10) * 100, 100)}%` }}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Alt Attributes */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Image Alt Attributes</h4>
                {renderCheckMark("imageAlt", ["image alt", "alt attribute", "alt text"])}
              </div>
              <p className="text-gray-600 mb-2">
                {getImageAltContent()}
              </p>
              {safeReport.images.total > 0 && (
                <p className="text-gray-600 mb-3">
                  We found {safeReport.images.total} image{safeReport.images.total > 1 ? "s" : ""} on your page{safeReport.images.withoutAlt > 0 ? ` and ${safeReport.images.withoutAlt} of them ${safeReport.images.withoutAlt === 1 ? "is" : "are"} missing the attribute` : " and all have Alt Attributes"}.
                </p>
              )}
              <p className="text-gray-600 text-sm">
                Alt Attributes are an often overlooked and simple way to signal to Search Engines what an image is about, and help it rank in image search results.
              </p>
            </div>

            {/* SSL Enabled */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">SSL Enabled</h4>
                {renderCheckMark("ssl", ["ssl", "https", "secure"])}
              </div>
              <p className="text-gray-600">
                {getSSLContent()}
              </p>
            </div>

            {/* Robots.txt */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Robots.txt</h4>
                {renderCheckMark("robotsTxt", ["robots.txt", "robots"])}
              </div>
              <p className="text-gray-600 mb-2">
                {getRobotsTxtContent()}
              </p>
              {safeReport.technicalSEO.robotsTxtUrl && (
                <div className="bg-gray-50 p-3 rounded">
                  <a href={safeReport.technicalSEO.robotsTxtUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {safeReport.technicalSEO.robotsTxtUrl}
                  </a>
                </div>
              )}
            </div>

            {/* XML Sitemaps */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">XML Sitemaps</h4>
                {renderCheckMark("sitemap", ["sitemap", "xml sitemap"])}
              </div>
              <p className="text-gray-600 mb-2">
                {getSitemapContent()}
              </p>
              {safeReport.technicalSEO.sitemapUrl && (
                <div className="bg-gray-50 p-3 rounded mb-2">
                  <a href={safeReport.technicalSEO.sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {safeReport.technicalSEO.sitemapUrl}
                  </a>
                </div>
              )}
              {getCheckStatus("sitemap", ["sitemap", "xml sitemap"]) && (
                <p className="text-gray-500 text-sm">More Sitemaps were found, but not tested.</p>
              )}
            </div>

            {/* Analytics */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Analytics</h4>
                {renderCheckMark("analytics", ["analytics", "google analytics"])}
              </div>
              <p className="text-gray-600 mb-2">
                {getAnalyticsContent()}
              </p>
              {!getCheckStatus("analytics", ["analytics", "google analytics"]) && (
                <p className="text-gray-600 text-sm">
                  Website analytics tools like Google Analytics assist you in measuring, analyzing and ultimately improving traffic to your page.
                </p>
              )}
            </div>

            {/* Schema.org Structured Data */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Schema.org Structured Data</h4>
                {renderCheckMark("schema", ["schema", "structured data", "json-ld"])}
              </div>
              <p className="text-gray-600">
                {getSchemaContent()}
              </p>
            </div>

            {/* Identity Schema */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Identity Schema</h4>
                {renderCheckMark("identitySchema", ["identity schema", "organization schema", "person schema"])}
              </div>
              <p className="text-gray-600 mb-2">
                {getIdentitySchemaContent()}
              </p>
              {safeReport.technicalSEO.identityType && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-gray-700"><span className="font-medium">{safeReport.technicalSEO.identityType}</span></p>
                </div>
              )}
              {!getCheckStatus("identitySchema", ["identity schema", "organization schema", "person schema"]) && (
                <p className="text-gray-600 text-sm">
                  The absence of Organization or Person Schema can make it harder for Search Engines and LLMs to identify the ownership of a website and confidently answer brand, company or person queries.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Social Results Section */}
        <div className="bg-white rounded-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Social Results
          </h2>

          {/* Score and Message */}
          <div className="flex items-start gap-8 mb-8">
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={safeReport.social.score === 0 ? "stroke-gray-300" : getScoreRingColor(safeReport.social.score)}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={439.6}
                  strokeDashoffset={439.6 - (safeReport.social.score / 100) * 439.6}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-5xl font-bold ${safeReport.social.score === 0 ? "text-gray-400" : getScoreColor(safeReport.social.score)}`}>
                  <EditableScore
                    score={safeReport.social.score}
                    onSave={(newScore) => updateReportField(["social", "score"], newScore)}
                    className="inline-block"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                <EditableField
                  value={safeReport.social.message}
                  onSave={(newValue) => updateReportField(["social", "message"], newValue)}
                  displayClassName="text-2xl font-semibold text-gray-900"
                />
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <EditableField
                  value={safeReport.social.description}
                  onSave={(newValue) => updateReportField(["social", "description"], newValue)}
                  multiline={true}
                  displayClassName="text-gray-600 leading-relaxed"
                />
              </p>
            </div>
          </div>

          {/* Social Media Checks */}
          <div className="space-y-4">
            {/* Facebook Page Linked */}
            <div className="flex items-start justify-between py-4 border-b border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Facebook Page Linked</h4>
                <p className="text-gray-600 text-sm">
                  {getFacebookContent()}
                </p>
                {!getCheckStatus("facebook", ["facebook", "facebook page"]) && (
                  <p className="text-gray-500 text-sm mt-2">
                    Facebook is one of the top social media platforms and linking your business page helps strengthen your online presence.
                  </p>
                )}
                {safeReport.social.facebookUrl && (
                  <a href={safeReport.social.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
                    {safeReport.social.facebookUrl}
                  </a>
                )}
              </div>
              {renderCheckMark("facebook", ["facebook", "facebook page"])}
            </div>

            {/* Instagram Linked */}
            <div className="flex items-start justify-between py-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Instagram Linked</h4>
                <p className="text-gray-600 text-sm">
                  {getInstagramContent()}
                </p>
                {!getCheckStatus("instagram", ["instagram", "instagram account"]) && (
                  <p className="text-gray-500 text-sm mt-2">
                    Instagram is a highly visual platform that can help showcase your brand and engage with customers.
                  </p>
                )}
                {safeReport.social.instagramUrl && (
                  <a href={safeReport.social.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
                    {safeReport.social.instagramUrl}
                  </a>
                )}
              </div>
              {renderCheckMark("instagram", ["instagram", "instagram account"])}
            </div>
          </div>
        </div>

        {/* Local SEO Section */}
        <div className="bg-white rounded-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Local SEO
          </h2>

          {/* Local SEO Checks */}
          <div className="space-y-4">
            {/* Address & Phone Shown on Website */}
            <div className="flex items-start justify-between py-4 border-b border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Address & Phone Shown on Website</h4>
                <p className="text-gray-600 text-sm mb-2">
                  {getAddressPhoneContent()}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  Displaying your business address and phone number prominently helps build trust with visitors and is important for local SEO.
                </p>
                {(safeReport.localSEO.hasPhone || safeReport.localSEO.hasAddress) ? (
                  <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                    {safeReport.localSEO.hasPhone && safeReport.localSEO.phoneNumber ? (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-15">Phone</span>
                        <span className="text-gray-700">{safeReport.localSEO.phoneNumber}</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-15">Phone</span>
                        <span className="text-red-600">Not found</span>
                      </div>
                    )}
                    {safeReport.localSEO.hasAddress && safeReport.localSEO.addressText ? (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-15">Address</span>
                        <span className="text-gray-700">{safeReport.localSEO.addressText}</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium min-w-15">Address</span>
                        <span className="text-red-600">Not found</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-gray-500 font-medium min-w-15">Phone</span>
                      <span className="text-red-600">Not found</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 font-medium min-w-15">Address</span>
                      <span className="text-red-600">Not found</span>
                    </div>
                  </div>
                )}
              </div>
              {renderCheckMark("addressPhone", ["address", "phone", "contact"])}
            </div>

            {/* Local Business Schema */}
            <div className="flex items-start justify-between py-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Local Business Schema</h4>
                <p className="text-gray-600 text-sm">
                  {getLocalBusinessSchemaContent()}
                </p>
              </div>
              {renderCheckMark("localBusinessSchema", ["local business schema", "local schema"])}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Copy this link to share your SEO report with your clients.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="link"
                defaultValue={`${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${params.id}`}
                readOnly
                className="h-10"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Anyone with this link will be able to view this report.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
