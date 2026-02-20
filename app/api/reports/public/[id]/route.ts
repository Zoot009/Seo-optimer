import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public GET endpoint - No authentication required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;

    console.log(`[PUBLIC REPORT ${id}] Fetching report for public view`);

    // Fetch the report without user verification
    const report = await prisma.report.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        website: true,
        status: true,
        reportData: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!report) {
      console.log(`[PUBLIC REPORT ${id}] Report not found`);
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    console.log(`[PUBLIC REPORT ${id}] Report found with status: ${report.status}`);

    // Only return completed reports for public view
    if (report.status !== "completed") {
      console.log(`[PUBLIC REPORT ${id}] Report not completed yet (status: ${report.status})`);
      return NextResponse.json(
        { 
          report: {
            id: report.id,
            status: report.status,
            website: report.website,
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { report },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        }
      }
    );
  } catch (error) {
    console.error("[PUBLIC REPORT] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
