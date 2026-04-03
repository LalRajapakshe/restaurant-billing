import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Implement bills list retrieval
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Implement bill creation
    return NextResponse.json({ success: true, data: {} }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
