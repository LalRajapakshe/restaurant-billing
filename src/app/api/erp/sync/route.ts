import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // TODO: Implement ERP sync logic
    return NextResponse.json({ success: true, message: 'Sync initiated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync with ERP' }, { status: 500 });
  }
}
