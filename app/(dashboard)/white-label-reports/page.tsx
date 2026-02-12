"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileCheck,
  Globe,
  ClipboardList,
  Search,
  TrendingUp,
  Link as LinkIcon,
  BarChart3,
  Settings,
  User,
  Users,
  LogOut,
  HelpCircle,
  ChevronUp,
  Trash2,
} from "lucide-react";

interface Report {
  id: string;
  website: string;
  options: string;
  status: string;
  createdAt: string;
  scheduled?: string;
}

export default function WhiteLabelReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("White Label Reports");
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Auditing"]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    );
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const userData = getUser();
    setUser(userData);
    fetchReports();
    setLoading(false);

    // Auto-refresh every 5 seconds to check for completed reports
    const interval = setInterval(() => {
      fetchReports();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("seomaster_auth_token");
      const response = await fetch("/api/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleAddReport = async () => {
    if (!websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("seomaster_auth_token");
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          website: websiteUrl,
          options: "Default",
        }),
      });

      if (response.ok) {
        setWebsiteUrl("");
        toast.success("Report created successfully!");
        fetchReports();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Failed to create report");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/white-label-reports/${reportId}`);
  };

  const handleDeleteReport = async (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
    setOpenDropdown(null);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      const token = localStorage.getItem("seomaster_auth_token");
      const response = await fetch(`/api/reports/${reportToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Report deleted successfully");
        setDeleteDialogOpen(false);
        setReportToDelete(null);
        fetchReports();
      } else {
        toast.error("Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const filteredReports = reports.filter((report) =>
    report.website.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={() => setActiveMenu("Dashboard")}
              className={`w-full px-6 py-3 text-left font-medium transition-colors ${
                activeMenu === "Dashboard"
                  ? "bg-[#2d3748] text-white"
                  : "text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
              }`}
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
                  <Search className="h-4 w-4" />
                  SEO Analyzer
                </button>
                <button className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  Report Templates
                </button>
                <Link href="/white-label-reports">
                  <button
                    className={`w-full px-6 py-2 text-left text-sm transition-colors flex items-center gap-3 ${
                      activeMenu === "White Label Reports"
                        ? "bg-[#1a1a1a] text-white"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]"
                    }`}
                  >
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
              activeMenu === "Other Tools"
                ? "bg-[#2d3748] text-white"
                : "text-gray-300 hover:text-gray-100 hover:bg-[#1a1a1a]"
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
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer">
              <span className="font-medium">Help</span>
              <HelpCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* White Label Reports Section */}
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            White Label Reports
          </h1>
          <p className="text-gray-600 text-base mb-6 max-w-4xl">
            You can run a Website Audit by entering a website into the field
            below. You'll have the option to view the Report in PDF form or as
            a basic web-page. Reports will use your company's logo and branding
            settings as defined in the next tab. You can share these reports
            with your prospects or customers.
          </p>
          <p className="text-gray-600 text-base mb-8">
            Please complete details in the Report Settings tab to White Label
            your reports.
          </p>

          {/* Add Report Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <Input
                type="text"
                placeholder="http://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1 h-11 bg-white border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddReport();
                  }
                }}
              />
              <Button
                variant="outline"
                className="h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Options
              </Button>
              <Button
                onClick={handleAddReport}
                disabled={creating}
                className="h-11 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {creating ? "Creating..." : "Add Report"}
              </Button>
            </div>
          </div>

          {/* Search and Reports Table */}
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 flex justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-9 bg-white border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        #
                        <ChevronUp className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Options
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No reports found. Add your first website to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report, index) => (
                      <tr
                        key={report.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {filteredReports.length - index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {report.website}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              report.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : report.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : report.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.options}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.scheduled
                            ? new Date(report.scheduled).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewReport(report.id)}
                              disabled={report.status !== "completed"}
                              className="bg-blue-500 hover:bg-blue-600 text-white h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {report.status === "processing"
                                ? "Processing..."
                                : "PDF"}
                            </Button>
                            <div className="relative">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8"
                                onClick={() => setOpenDropdown(openDropdown === report.id ? null : report.id)}
                              >
                                Options
                              </Button>
                              {openDropdown === report.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleDeleteReport(report.id)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Report
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Report</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this report? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
