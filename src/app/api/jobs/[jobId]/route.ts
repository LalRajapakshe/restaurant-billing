import { NextRequest, NextResponse } from "next/server";

type JobRouteContext = {
    params: Promise<{ jobId: string }>;
};

export async function GET(
    request: NextRequest,
    context: JobRouteContext
) {
    try {
        const { jobId } = await context.params;

        return NextResponse.json({
            success: true,
            data: {
                id: jobId,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch job" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: JobRouteContext
) {
    try {
        const { jobId } = await context.params;
        const body = await request.json().catch(() => ({}));

        return NextResponse.json({
            success: true,
            data: {
                id: jobId,
                ...body,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update job" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: JobRouteContext
) {
    try {
        const { jobId } = await context.params;

        return NextResponse.json({
            success: true,
            data: {
                id: jobId,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete job" },
            { status: 500 }
        );
    }
}