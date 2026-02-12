import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt-service";
import prisma from "@/lib/prisma";

// GET /api/reports - Fetch all reports for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("token")?.value;

    if (!token) {
      // Try localStorage token (sent in query or header)
      const url = new URL(request.url);
      const queryToken = url.searchParams.get("token");
      
      if (!queryToken) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }

    // Verify token
    const payload = verifyToken(token || "");
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch reports for this user
    const reports = await prisma.report.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json();
    const { website, options = "Default" } = body;

    // Validate website URL
    if (!website || typeof website !== "string") {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    // Create the report with pending status
    const report = await prisma.report.create({
      data: {
        userId: payload.userId,
        website: website,
        options: options,
        status: "processing",
      },
    });

    console.log(`[REPORT ${report.id}] Starting SEO analysis for: ${website}`);

    // Start background analysis by calling VPS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const backendApiKey = process.env.BACKEND_API_KEY;

    fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": backendApiKey || "",
      },
      body: JSON.stringify({
        url: website,
        reportId: report.id,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Backend returned status ${response.status}`);
        }
        return response.json();
      })
      .then(async (result) => {
        console.log(`[REPORT ${report.id}] Analysis completed successfully`);
        // Update report with analysis results
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: "completed",
            reportData: result.data as any,
          },
        });
        console.log(`[REPORT ${report.id}] Report updated to completed status`);
      })
      .catch(async (error) => {
        console.error(`[REPORT ${report.id}] Analysis failed:`, error);
        console.error(`[REPORT ${report.id}] Error message:`, error.message);
        // Mark as failed
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: "failed",
            reportData: {
              error: error.message,
            },
          },
        });
        console.log(`[REPORT ${report.id}] Report marked as failed`);
      });

    return NextResponse.json(
      { message: "Report created successfully", report },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
