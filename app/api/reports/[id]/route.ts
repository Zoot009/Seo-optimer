import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt-service";
import prisma from "@/lib/prisma";

// Function to trigger SEO analysis
async function triggerAnalysis(reportId: string, website: string) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const backendApiKey = process.env.BACKEND_API_KEY;

  console.log(`[REPORT ${reportId}] Starting SEO analysis for: ${website}`);

  fetch(`${backendUrl}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": backendApiKey || "",
    },
    body: JSON.stringify({
      url: website,
      reportId: reportId,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      return response.json();
    })
    .then(async (result) => {
      console.log(`[REPORT ${reportId}] Analysis completed successfully`);
      // Update report with analysis results
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "completed",
          reportData: result.data as any,
        },
      });
      console.log(`[REPORT ${reportId}] Report updated to completed status`);
    })
    .catch(async (error) => {
      console.error(`[REPORT ${reportId}] Analysis failed:`, error);
      console.error(`[REPORT ${reportId}] Error message:`, error.message);
      // Mark as failed
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "failed",
          reportData: {
            error: error.message,
          },
        },
      });
      console.log(`[REPORT ${reportId}] Report marked as failed`);
    });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;

    // Get query parameters
    const url = new URL(request.url);
    const reanalyze = url.searchParams.get("reanalyze") === "true";

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch the report
    let report = await prisma.report.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found or access denied" },
        { status: 404 }
      );
    }

    // If report is pending or reanalyze is requested, trigger analysis
    if (report.status === "pending" || reanalyze) {
      // Update status to processing
      report = await prisma.report.update({
        where: { id },
        data: { status: "processing" },
      });

      // Trigger analysis in background
      triggerAnalysis(report.id, report.website);
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if report exists and belongs to user
    const report = await prisma.report.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the report
    await prisma.report.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
