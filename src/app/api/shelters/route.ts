/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dataSync } from "@/lib/data-sync";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Use our new data sync system with caching
    const shelters = await dataSync.getFreshData('shelters', { limit, offset }) as any[];
    
    return NextResponse.json({ 
      success: true,
      shelters,
      pagination: {
        limit,
        offset,
        total: shelters.length // In production, you'd want a separate count query
      }
    });
  } catch (error) {
    console.error('Shelters API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shelters', success: false },
      { status: 500 }
    );
  }
}
