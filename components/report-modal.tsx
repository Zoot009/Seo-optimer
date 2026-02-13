"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Share2, Download } from "lucide-react";
import Image from "next/image";

interface ReportData {
  url: string;
  score: number;
  grade: string;
  screenshot?: string;
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

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData | null;
  loading?: boolean;
}

export default function ReportModal({
  isOpen,
  onClose,
  report,
  loading = false,
}: ReportModalProps) {
  // Helper function to safely extract hostname from URL
  const getHostname = (url: string): string => {
    try {
      // Add protocol if missing
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      return new URL(urlWithProtocol).hostname;
    } catch {
      // If URL parsing fails, return the original URL
      return url;
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Loading Report</DialogTitle>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing website...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return null;
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

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeReport.score / 100) * circumference;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">
          SEO Report for {getHostname(safeReport.url)}
        </DialogTitle>
        {/* Header */}
        <div className="bg-[#2c3e50] text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium bg-white text-[#2c3e50] px-3 py-1 rounded">
                Default Template
              </span>
            </div>
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
              >
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gray-50">
          {/* Introduction */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Website Report for {getHostname(safeReport.url)}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 absolute top-8 right-8"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
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
              Audit Results for {getHostname(safeReport.url)}
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
                      <div className="text-gray-500 text-sm mt-1">
                        Grade: {safeReport.grade}
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
                
                {/* Smaller Score Circles */}
                <div className="flex gap-6 mt-6 justify-center">
                  {/* On-Page SEO Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          className={getScoreRingColor(safeReport.onPageSEO.score)}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={351.68}
                          strokeDashoffset={351.68 - (safeReport.onPageSEO.score / 100) * 351.68}
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-3xl font-bold ${getScoreColor(safeReport.onPageSEO.score)}`}>
                          {safeReport.onPageSEO.score}
                        </div>
                      </div>
                    </div>
                    <p className="text-blue-600 font-medium mt-2 text-sm">On-Page SEO</p>
                  </div>

                  {/* Social Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          className={safeReport.social.score === 0 ? "stroke-gray-300" : getScoreRingColor(safeReport.social.score)}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={351.68}
                          strokeDashoffset={351.68 - (safeReport.social.score / 100) * 351.68}
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-3xl font-bold ${safeReport.social.score === 0 ? "text-gray-400" : getScoreColor(safeReport.social.score)}`}>
                          {safeReport.social.score}
                        </div>
                      </div>
                    </div>
                    <p className="text-blue-600 font-medium mt-2 text-sm">Social</p>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <div className="flex items-center justify-center">
                {safeReport.screenshot ? (
                  <div className="relative w-full max-w-md border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={safeReport.screenshot}
                      alt={`Screenshot of ${safeReport.url}`}
                      className="w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No screenshot available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Meta Tags */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Meta Tags
              </h3>
              <div className="space-y-3">
                <MetricRow
                  label="Title Tag"
                  value={safeReport.metaTags.hasTitle ? "✓" : "✗"}
                  isGood={safeReport.metaTags.hasTitle}
                />
                <MetricRow
                  label="Title Length"
                  value={`${safeReport.metaTags.titleLength} chars`}
                  isGood={
                    safeReport.metaTags.titleLength >= 10 &&
                    safeReport.metaTags.titleLength <= 60
                  }
                />
                <MetricRow
                  label="Description"
                  value={safeReport.metaTags.hasDescription ? "✓" : "✗"}
                  isGood={safeReport.metaTags.hasDescription}
                />
                <MetricRow
                  label="Viewport"
                  value={safeReport.metaTags.hasViewport ? "✓" : "✗"}
                  isGood={safeReport.metaTags.hasViewport}
                />
                <MetricRow
                  label="Open Graph Tags"
                  value={safeReport.metaTags.hasOgTags ? "✓" : "✗"}
                  isGood={safeReport.metaTags.hasOgTags}
                />
              </div>
            </div>

            {/* Headings */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Headings</h3>
              <div className="space-y-3">
                <MetricRow
                  label="H1 Tag"
                  value={safeReport.headings.hasH1 ? "✓" : "✗"}
                  isGood={safeReport.headings.hasH1}
                />
                <MetricRow
                  label="H1 Count"
                  value={safeReport.headings.h1Count.toString()}
                  isGood={safeReport.headings.h1Count === 1}
                />
                <MetricRow
                  label="H2 Tags"
                  value={safeReport.headings.h2Count.toString()}
                  isGood={safeReport.headings.h2Count > 0}
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Images</h3>
              <div className="space-y-3">
                <MetricRow
                  label="Total Images"
                  value={safeReport.images.total.toString()}
                  isGood={true}
                />
                <MetricRow
                  label="With Alt Text"
                  value={safeReport.images.withAlt.toString()}
                  isGood={safeReport.images.altPercentage === 100}
                />
                <MetricRow
                  label="Alt Coverage"
                  value={`${safeReport.images.altPercentage}%`}
                  isGood={safeReport.images.altPercentage >= 80}
                />
              </div>
            </div>

            {/* Links */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Links</h3>
              <div className="space-y-3">
                <MetricRow
                  label="Total Links"
                  value={safeReport.links.total.toString()}
                  isGood={safeReport.links.total > 0}
                />
                <MetricRow
                  label="Internal Links"
                  value={safeReport.links.internal.toString()}
                  isGood={safeReport.links.internal > 0}
                />
                <MetricRow
                  label="External Links"
                  value={safeReport.links.external.toString()}
                  isGood={true}
                />
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Performance
              </h3>
              <div className="space-y-3">
                <MetricRow
                  label="Load Time"
                  value={`${(safeReport.performance.loadTime / 1000).toFixed(2)}s`}
                  isGood={safeReport.performance.loadTime < 3000}
                />
                <MetricRow
                  label="Page Size"
                  value={`${safeReport.performance.pageSize} KB`}
                  isGood={safeReport.performance.pageSize < 500}
                />
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Content</h3>
              <div className="space-y-3">
                <MetricRow
                  label="Word Count"
                  value={safeReport.content.wordCount.toString()}
                  isGood={safeReport.content.wordCount >= 300}
                />
                <MetricRow
                  label="Text Length"
                  value={`${safeReport.content.textLength} chars`}
                  isGood={safeReport.content.textLength > 500}
                />
              </div>
            </div>

            {/* Technical SEO */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Technical SEO
              </h3>
              <div className="space-y-3">
                <MetricRow
                  label="HTTPS/SSL"
                  value={safeReport.technicalSEO.hasSSL ? "✓" : "✗"}
                  isGood={safeReport.technicalSEO.hasSSL}
                />
                <MetricRow
                  label="Mobile Responsive"
                  value={safeReport.technicalSEO.isResponsive ? "✓" : "✗"}
                  isGood={safeReport.technicalSEO.isResponsive}
                />
              </div>
            </div>
          </div>

          {/* On-Page SEO Results Section */}
          <div className="bg-white rounded-lg p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              On-Page SEO Results
            </h2>

            {/* Score and Message */}
            <div className="flex items-start gap-8 mb-8">
              <div className="relative w-40 h-40 flex-shrink-0">
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
                  {safeReport.metaTags.hasTitle && safeReport.metaTags.titleLength >= 50 && safeReport.metaTags.titleLength <= 60
                    ? "You have a Title Tag of optimal length (between 50 and 60 characters)."
                    : safeReport.metaTags.hasTitle
                    ? `Your Title Tag length (${safeReport.metaTags.titleLength} characters) is not optimal. Recommended length is between 50 and 60 characters.`
                    : "Your page is missing a Title Tag."}
                </p>
                {safeReport.title && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-800 font-medium">{safeReport.title}</p>
                    <p className="text-gray-500 text-sm mt-1">Length : {safeReport.metaTags.titleLength}</p>
                  </div>
                )}
              </div>

              {/* Meta Description */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-lg">Meta Description Tag</h4>
                  <span className={`text-3xl font-bold ${safeReport.metaTags.hasDescription && safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160 ? "text-green-500" : "text-red-500"}`}>{safeReport.metaTags.hasDescription && safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160 ? "✓" : "✗"}</span>
                </div>
                <p className="text-gray-600 mb-3">
                  {safeReport.metaTags.hasDescription && safeReport.metaTags.descriptionLength >= 120 && safeReport.metaTags.descriptionLength <= 160
                    ? "Your page has a Meta Description of optimal length (between 120 and 160 characters)."
                    : safeReport.metaTags.hasDescription
                    ? `Your Meta Description length (${safeReport.metaTags.descriptionLength} characters) is not optimal. Recommended length is between 120 and 160 characters.`
                    : "Your page is missing a Meta Description."}
                </p>
                {safeReport.description && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-800">{safeReport.description}</p>
                    <p className="text-gray-500 text-sm mt-1">Length : {safeReport.metaTags.descriptionLength}</p>
                  </div>
                )}
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
                    ? "Your page is making use multiple levels of Header Tags." 
                    : "Your page should use multiple levels of Header Tags."}
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
                <p className="text-gray-600">
                  {safeReport.images.withoutAlt === 0
                    ? "You do not have any images missing Alt Attributes on your page."
                    : `You have ${safeReport.images.withoutAlt} image${safeReport.images.withoutAlt > 1 ? "s" : ""} missing Alt Attributes on your page.`}
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
                  <span className={`text-3xl font-bold ${safeReport.technicalSEO.hasSchema ? "text-green-500" : "text-red-500"}`}>{safeReport.technicalSEO.hasSchema ? "✓" : "✗"}</span>
                </div>
                <p className="text-gray-600 mb-2">
                  {safeReport.technicalSEO.hasJsonLd 
                    ? "You are using JSON-LD Schema on your page." 
                    : safeReport.technicalSEO.hasSchema
                    ? "Your page is using Schema.org structured data." 
                    : "Your page is not using Schema.org structured data."}
                </p>
                {safeReport.technicalSEO.hasSchema && safeReport.technicalSEO.schemaTypes && safeReport.technicalSEO.schemaTypes.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-700 font-medium mb-1">Schema Types Found:</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {safeReport.technicalSEO.schemaTypes.map((type, idx) => (
                        <li key={idx}>{type}</li>
                      ))}
                    </ul>
                    {(safeReport.technicalSEO.hasMicrodata || safeReport.technicalSEO.hasRDFa) && (
                      <p className="text-gray-500 text-sm mt-2">
                        Additional formats: {[
                          safeReport.technicalSEO.hasMicrodata && "Microdata",
                          safeReport.technicalSEO.hasRDFa && "RDFa"
                        ].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                )}
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
                    : "No Organization or Person Schema found on the page."}
                </p>
                {safeReport.technicalSEO.identityType && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-700"><span className="font-medium">{safeReport.technicalSEO.identityType}</span></p>
                  </div>
                )}
              </div>

              {/* Rendered Content */}
              <div className="pb-6">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-lg">Rendered Content (LLM Readability)</h4>
                  <span className="text-3xl font-bold text-green-500">✓</span>
                </div>
                <p className="text-gray-600 mb-2">
                  Your page has a low level of rendered content which tends to make it more readable for LLMs.
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-700">Rendering Percentage: 13%</p>
                </div>
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
              <div className="relative w-40 h-40 flex-shrink-0">
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
                      ? "Facebook Page found as a link on your page." 
                      : "No associated Facebook Page found as a link on your page."}
                  </p>
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
                      ? "Instagram Profile found linked on your page." 
                      : "No associated Instagram Profile found linked on your page."}
                  </p>
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
                  <h4 className="font-semibold text-gray-900 mb-1">Address &amp; Phone Shown on Website</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {(safeReport.localSEO.hasPhone && safeReport.localSEO.hasAddress)
                      ? "Address and Phone Number visible on the page."
                      : safeReport.localSEO.hasPhone
                      ? "Phone Number visible on the page, but Address not found."
                      : safeReport.localSEO.hasAddress
                      ? "Address visible on the page, but Phone Number not found."
                      : "Address and Phone Number not visible on the page."}
                  </p>
                  {(safeReport.localSEO.hasPhone || safeReport.localSEO.hasAddress) && (
                    <div className="space-y-2 text-sm">
                      {safeReport.localSEO.hasPhone && safeReport.localSEO.phoneNumber && (
                        <div className="flex gap-2">
                          <span className="text-gray-500 font-medium">Phone</span>
                          <span className="text-gray-700">{safeReport.localSEO.phoneNumber}</span>
                        </div>
                      )}
                      {safeReport.localSEO.hasAddress && safeReport.localSEO.addressText && (
                        <div className="flex gap-2">
                          <span className="text-gray-500 font-medium">Address</span>
                          <span className="text-gray-700">{safeReport.localSEO.addressText}</span>
                        </div>
                      )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricRow({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm font-medium ${
          isGood ? "text-green-600" : "text-red-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
