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

    // Fetch reports for this user (only metadata, not full reportData)
    const startTime = Date.now();
    const reports = await prisma.report.findMany({
      where: {
        userId: payload.userId,
      },
      select: {
        id: true,
        website: true,
        options: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        scheduled: true,
        // Explicitly exclude reportData to improve performance
        // reportData: false (not needed for list view)
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to most recent 100 reports
    });
    const queryTime = Date.now() - startTime;
    console.log(`[REPORTS API] Fetched ${reports.length} reports for user ${payload.userId} in ${queryTime}ms`);

    // Add caching headers - cache for 10 seconds
    return NextResponse.json({ reports }, {
      headers: {
        'Cache-Control': 'private, max-age=10, must-revalidate',
        'ETag': `W/"reports-${payload.userId}-${Date.now()}"`,
      }
    });
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

    // Create the report with pending status - analysis will start when user views it
    const report = await prisma.report.create({
      data: {
        userId: payload.userId,
        website: website,
        options: options,
        status: "pending",
      },
      select: {
        id: true,
        website: true,
        options: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        scheduled: true,
      },
    });

    console.log(`[REPORT ${report.id}] Report created - analysis will start on first view`);

    return NextResponse.json(
      { message: "Report created successfully", report },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
