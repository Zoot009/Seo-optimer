"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Share2,
  Download,
  X,
} from "lucide-react";

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
}

export default function ReportViewPage() {
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [reportMetadata, setReportMetadata] = useState<{ createdAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Always trigger reanalysis when viewing a report
    fetchReport(true);
  }, [params.id]);

  const fetchReport = async (reanalyze = false) => {
    try {
      const token = localStorage.getItem("seomaster_auth_token");
      
      // Add reanalyze query param to always fetch fresh data
      const url = reanalyze 
        ? `/api/reports/${params.id}?reanalyze=true`
        : `/api/reports/${params.id}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.report.status === "completed" && data.report.reportData) {
          // Report is ready - display it immediately
          setReport(data.report.reportData);
          setReportMetadata({ createdAt: data.report.createdAt });
        } else if (data.report.status === "processing" || data.report.status === "pending") {
          // Silent polling - check again in 1 second
          setTimeout(() => fetchReport(false), 1000);
        } else if (data.report.status === "failed") {
          setError("Report generation failed");
          toast.error("Report generation failed.");
        }
      } else {
        setError("Failed to load report");
        toast.error("Failed to load report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
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
    return null; // Blank page while waiting for report to load
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

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      toast.loading("Generating PDF...");
      
      // Dynamically import html2pdf only on client side
      const html2pdf = (await import("html2pdf.js")).default;
      
      const options = {
        margin: 0.5,
        filename: `seo-report-${getHostname(safeReport.url)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' as const
        }
      };

      await html2pdf().set(options).from(reportRef.current).save();
      
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate PDF. Please try again.");
    }
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
                      {safeReport.score}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 font-medium mt-4 text-lg">
                {getScoreMessage(safeReport.score)}
              </p>
              {safeReport.recommendations.length > 0 && (
                <button
                  onClick={() => {
                    const element = document.getElementById('recommendations-section');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="mt-3 inline-block bg-pink-50 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  <span className="font-semibold">Recommendations: {safeReport.recommendations.length}</span>
                </button>
              )}

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
                        {safeReport.onPageSEO.score}
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
                        {safeReport.social.score}
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
        {safeReport.recommendations.length > 0 && (
          <div id="recommendations-section" className="bg-white rounded-lg p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recommendations
            </h2>
            <div className="space-y-1">
              {safeReport.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {rec.category}
                    </span>
                    <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  {safeReport.onPageSEO.score}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {safeReport.onPageSEO.message}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {safeReport.onPageSEO.description}
              </p>
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="space-y-6">
            {/* Title Tag */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Title Tag</h4>
                <span className={`text-3xl font-bold ${safeReport.metaTags.hasTitle && safeReport.metaTags.titleLength >= 50 && safeReport.metaTags.titleLength <= 60 ? "text-green-500" : "text-red-500"}`}>{safeReport.metaTags.hasTitle && safeReport.metaTags.titleLength >= 50 && safeReport.metaTags.titleLength <= 60 ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-3">
                {!safeReport.metaTags.hasTitle
                  ? "Your page does not have a Title Tag."
                  : safeReport.metaTags.titleLength >= 50 && safeReport.metaTags.titleLength <= 60
                  ? "You have a Title Tag of optimal length (between 50 and 60 characters)."
                  : safeReport.metaTags.titleLength < 50
                  ? "You have a Title Tag, but ideally it should be lengthened to between 50 and 60 characters (including spaces)."
                  : "You have a Title Tag, but ideally it should be shortened to between 50 and 60 characters (including spaces)."}
              </p>
              {safeReport.title && (
                <div className="bg-gray-50 p-4 rounded mb-3">
                  <p className="text-gray-800">{safeReport.title}</p>
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
                <h4 className="font-semibold text-gray-900 text-lg">Meta Description Tag</h4>
                <span className={`text-3xl font-bold ${safeReport.metaTags.hasDescription && safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160 ? "text-green-500" : "text-red-500"}`}>{safeReport.metaTags.hasDescription && safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160 ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-3">
                {!safeReport.metaTags.hasDescription
                  ? "Your page does not have a Meta Description Tag."
                  : safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160
                  ? "You have a Meta Description Tag of optimal length (between 120 and 160 characters)."
                  : safeReport.metaTags.descriptionLength < 120
                  ? "Your page has a Meta Description Tag however, your Meta Description should ideally be lengthened to between 120 and 160 characters (including spaces)."
                  : "Your page has a Meta Description Tag however, your Meta Description should ideally be shortened to between 120 and 160 characters (including spaces)."}
              </p>
              {safeReport.description && (
                <div className="bg-gray-50 p-4 rounded mb-3">
                  <p className="text-gray-800">{safeReport.description}</p>
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
                <h4 className="font-semibold text-gray-900 text-lg">H1 Header Tag Usage</h4>
                <span className={`text-3xl font-bold ${safeReport.headings.h1Count === 1 ? "text-green-500" : "text-red-500"}`}>
                  {safeReport.headings.h1Count === 1 ? "✓" : "✗"}
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                {safeReport.headings.h1Count === 0
                  ? "Your page is missing an H1 Tag."
                  : safeReport.headings.h1Count === 1
                  ? "Your page has a H1 Tag."
                  : "Your page has more than one H1 Tag. It is generally recommended to only use one H1 Tag on a page."}
              </p>
              <p className="text-gray-500 text-sm">
                The H1 Header Tag is an important way of signaling to search engines what your content is about, and subsequently the keywords it should rank for.
              </p>
            </div>

            {/* H2-H6 Headers */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">H2-H6 Header Tag Usage</h4>
                <span className={`text-3xl font-bold ${safeReport.headings.h2Count > 0 ? "text-green-500" : "text-red-500"}`}>{safeReport.headings.h2Count > 0 ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-4">
                {safeReport.headings.h2Count > 0 
                  ? "Your page is making use of multiple levels of Header Tags (which is good)." 
                  : "Your page should use multiple levels of Header Tags, such as H2 and H3."}
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
                <span className={`text-3xl font-bold ${safeReport.images.withoutAlt === 0 ? "text-green-500" : "text-red-500"}`}>{safeReport.images.withoutAlt === 0 ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-2">
                {safeReport.images.withoutAlt === 0
                  ? "You do not have any images missing Alt Attributes on your page."
                  : "You have images on your page that are missing Alt Attributes."}
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
                <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasSSL ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasSSL ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600">
                {safeReport.technicalSEO.hasSSL 
                  ? "Your website has SSL enabled." 
                  : "Your website does not have SSL enabled."}
              </p>
            </div>

            {/* Robots.txt */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Robots.txt</h4>
                <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasRobotsTxt ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasRobotsTxt ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-2">
                {safeReport.technicalSEO.hasRobotsTxt 
                  ? "Your website appears to have a robots.txt file." 
                  : "Your website does not appear to have a robots.txt file."}
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
                <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasSitemap ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasSitemap ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-2">
                {safeReport.technicalSEO.hasSitemap 
                  ? "Your website appears to have an XML Sitemap." 
                  : "Your website does not appear to have an XML Sitemap."}
              </p>
              {safeReport.technicalSEO.sitemapUrl && (
                <div className="bg-gray-50 p-3 rounded mb-2">
                  <a href={safeReport.technicalSEO.sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {safeReport.technicalSEO.sitemapUrl}
                  </a>
                </div>
              )}
              {safeReport.technicalSEO.hasSitemap && (
                <p className="text-gray-500 text-sm">More Sitemaps were found, but not tested.</p>
              )}
            </div>

            {/* Analytics */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Analytics</h4>
                <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasAnalytics ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasAnalytics ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-2">
                {safeReport.technicalSEO.hasAnalytics 
                  ? "We detected an analytics tool installed on your page." 
                  : "We could not detect an analytics tool installed on your page."}
              </p>
              {!safeReport.technicalSEO.hasAnalytics && (
                <p className="text-gray-600 text-sm">
                  Website analytics tools like Google Analytics assist you in measuring, analyzing and ultimately improving traffic to your page.
                </p>
              )}
            </div>

            {/* Schema.org Structured Data */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Schema.org Structured Data</h4>
                <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasJsonLd ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasJsonLd ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600">
                {safeReport.technicalSEO.hasJsonLd 
                  ? "You are using JSON-LD Schema on your page." 
                  : "Your page is not using JSON-LD Schema."}
              </p>
            </div>

            {/* Identity Schema */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-lg">Identity Schema</h4>
                <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasIdentitySchema ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasIdentitySchema ? "✓" : "✗"}</span>
              </div>
              <p className="text-gray-600 mb-2">
                {safeReport.technicalSEO.hasIdentitySchema 
                  ? "Organization or Person Schema identified on the page." 
                  : "No Organization or Person Schema identified on the page."}
              </p>
              {safeReport.technicalSEO.identityType && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-gray-700"><span className="font-medium">{safeReport.technicalSEO.identityType}</span></p>
                </div>
              )}
              <p className="text-gray-600 text-sm">
                The absence of Organization or Person Schema can make it harder for Search Engines and LLMs to identify the ownership of a website and confidently answer brand, company or person queries.
              </p>
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
                  {safeReport.social.score}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {safeReport.social.message}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {safeReport.social.description}
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
                  {safeReport.social.hasFacebookPage 
                    ? "We found a linked Facebook Page on your website." 
                    : "We did not detect a Facebook Page linked to your website."}
                </p>
                {!safeReport.social.hasFacebookPage && (
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
              <span className={`text-3xl font-bold ${safeReport.social.hasFacebookPage ? "text-green-500" : "text-red-500"}`}>
                {safeReport.social.hasFacebookPage ? "✓" : "✗"}
              </span>
            </div>

            {/* Instagram Linked */}
            <div className="flex items-start justify-between py-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Instagram Linked</h4>
                <p className="text-gray-600 text-sm">
                  {safeReport.social.hasInstagram 
                    ? "We found a linked Instagram account on your website." 
                    : "We did not detect an Instagram account linked to your website."}
                </p>
                {!safeReport.social.hasInstagram && (
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
              <span className={`text-3xl font-bold ${safeReport.social.hasInstagram ? "text-green-500" : "text-red-500"}`}>
                {safeReport.social.hasInstagram ? "✓" : "✗"}
              </span>
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
                  {(safeReport.localSEO.hasPhone && safeReport.localSEO.hasAddress)
                    ? "We detected both an address and phone number on your website."
                    : safeReport.localSEO.hasPhone && !safeReport.localSEO.hasAddress
                    ? "We detected a phone number, but no address was found on your website."
                    : !safeReport.localSEO.hasPhone && safeReport.localSEO.hasAddress
                    ? "We detected an address, but no phone number was found on your website."
                    : "We did not detect an address or phone number on your website."}
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
              <span className={`text-3xl font-bold ${(safeReport.localSEO.hasPhone && safeReport.localSEO.hasAddress) ? "text-green-500" : "text-red-500"}`}>
                {(safeReport.localSEO.hasPhone && safeReport.localSEO.hasAddress) ? "✓" : "✗"}
              </span>
            </div>

            {/* Local Business Schema */}
            <div className="flex items-start justify-between py-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Local Business Schema</h4>
                <p className="text-gray-600 text-sm">
                  {safeReport.localSEO.hasLocalBusinessSchema 
                    ? "Local Business Schema identified on the page." 
                    : "No Local Business Schema identified on the page."}
                </p>
              </div>
              <span className={`text-3xl font-bold ${safeReport.localSEO.hasLocalBusinessSchema ? "text-green-500" : "text-red-500"}`}>
                {safeReport.localSEO.hasLocalBusinessSchema ? "✓" : "✗"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
