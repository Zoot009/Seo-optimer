import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt-service";
import prisma from "@/lib/prisma";

// Function to trigger SEO analysis
async function triggerAnalysis(reportId: string, website: string) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:6478";
  const backendApiKey = process.env.BACKEND_API_KEY;

  console.log(`[REPORT ${reportId}] Starting SEO analysis for: ${website}`);
  console.log(`[REPORT ${reportId}] Backend URL: ${backendUrl}`);
  console.log(`[REPORT ${reportId}] Backend API Key present: ${!!backendApiKey}`);

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
      console.log(`[REPORT ${reportId}] Backend response status: ${response.status}`);
      if (!response.ok) {
        const text = await response.text();
        console.error(`[REPORT ${reportId}] Backend error response:`, text);
        throw new Error(`Backend returned status ${response.status}`);
      }
      return response.json();
    })
    .then(async (result) => {
      console.log(`[REPORT ${reportId}] Analysis completed successfully`);
      console.log(`[REPORT ${reportId}] Result data size: ${JSON.stringify(result).length} bytes`);
      
      // Update report with analysis results
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "completed",
          reportData: result.data as any,
        },
      });
      console.log(`[REPORT ${reportId}] Database updated - Report status: ${updatedReport.status}`);
      console.log(`[REPORT ${reportId}] Report updated to completed status at ${new Date().toISOString()}`);
    })
    .catch(async (error) => {
      console.error(`[REPORT ${reportId}] Analysis failed:`, error);
      console.error(`[REPORT ${reportId}] Error message:`, error.message);
      console.error(`[REPORT ${reportId}] Error stack:`, error.stack);
      
      // Mark as failed
      try {
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "failed",
            reportData: {
              error: error.message,
            },
          },
        });
        console.log(`[REPORT ${reportId}] Report marked as failed in database`);
      } catch (dbError) {
        console.error(`[REPORT ${reportId}] Failed to update database with error status:`, dbError);
      }
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
    const statusOnly = url.searchParams.get("statusOnly") === "true";

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

    // If statusOnly, just check status without fetching large reportData
    if (statusOnly) {
      console.log(`[REPORT ${id}] Status-only check requested (lightweight polling)`);
      const report = await prisma.report.findFirst({
        where: {
          id,
          userId: payload.userId,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!report) {
        return NextResponse.json(
          { error: "Report not found or access denied" },
          { status: 404 }
        );
      }

      console.log(`[REPORT ${id}] Status check result: ${report.status}`);
      return NextResponse.json({ report }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // Fetch the report (with full data)
    console.log(`[REPORT ${id}] Fetching full report data (reanalyze: ${reanalyze})`);
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

    console.log(`[REPORT ${id}] Report status: ${report.status}, has data: ${!!report.reportData}`);

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

    return NextResponse.json({ report }, {
      headers: {
        'Cache-Control': 'private, max-age=30, must-revalidate',
        'ETag': `W/"report-${id}-${report.updatedAt || report.createdAt}"`,
      }
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Parse the request body
    const body = await request.json();
    const { reportData } = body;

    if (!reportData) {
      return NextResponse.json(
        { error: "Report data is required" },
        { status: 400 }
      );
    }

    console.log(`[UPDATE REPORT] Updating report ${id} for user ${payload.userId}`);

    // First, verify the report belongs to this user
    const existingReport = await prisma.report.findFirst({
      where: { id, userId: payload.userId },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found or access denied" },
        { status: 404 }
      );
    }

    // Update the report data
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        reportData: reportData as any,
        updatedAt: new Date(),
      },
    });

    console.log(`[UPDATE REPORT] Report ${id} updated successfully`);

    return NextResponse.json(
      { 
        message: "Report updated successfully",
        report: updatedReport
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
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

    console.log(`[DELETE REPORT] Starting delete for report ${id} by user ${payload.userId}`);
    const startTime = Date.now();

    // First, check if report exists and get its size info
    const reportInfo = await prisma.report.findFirst({
      where: { id, userId: payload.userId },
      select: { 
        id: true, 
        status: true,
        reportData: true, // Need this to check size
      },
    });

    if (!reportInfo) {
      return NextResponse.json(
        { error: "Report not found or access denied" },
        { status: 404 }
      );
    }

    const dataSize = reportInfo.reportData 
      ? JSON.stringify(reportInfo.reportData).length 
      : 0;
    console.log(`[DELETE REPORT] Report status: ${reportInfo.status}, Data size: ${(dataSize / 1024).toFixed(2)} KB`);

    // Delete the report
    const deleteStartTime = Date.now();
    await prisma.report.delete({
      where: { id },
    });

    const deleteTime = Date.now() - deleteStartTime;
    const totalTime = Date.now() - startTime;
    console.log(`[DELETE REPORT] Delete query took ${deleteTime}ms, Total time: ${totalTime}ms`);

    return NextResponse.json(
      { message: "Report deleted successfully" },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
