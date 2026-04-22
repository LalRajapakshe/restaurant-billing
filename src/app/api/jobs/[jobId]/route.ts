import { NextRequest, NextResponse } from "next/server";
import { mockJobs } from "@/data/mock-jobs";

type JobRouteContext = {
    params: Promise<{ jobId: string }>;
};

export async function GET(
    request: NextRequest,
    { params }: JobRouteContext
) {
    const { jobId } = await params;
    const job = mockJobs.find((item) => item.id === jobId);

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        data: job,
    });
}

export async function PUT(
    request: NextRequest,
    { params }: JobRouteContext
) {
    const { jobId } = await params;
    const body = await request.json().catch(() => ({}));

    return NextResponse.json({
        success: true,
        message: "Mock job update accepted.",
        data: {
            id: jobId,
            ...body,
        },
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: JobRouteContext
) {
    const { jobId } = await params;

    return NextResponse.json({
        success: true,
        message: "Mock job delete accepted.",
        data: { id: jobId },
    });
}
