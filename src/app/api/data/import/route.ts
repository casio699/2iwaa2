import { NextRequest, NextResponse } from 'next/server';
import { dataAcquisition } from '@/lib/data-acquisition';

export async function POST(request: NextRequest) {
  try {
    const { type, source } = await request.json();

    let result;
    switch (type) {
      case 'rss':
        result = await dataAcquisition.importRSSNews(source.url, source.name);
        break;
      case 'financial':
        result = await dataAcquisition.scrapeFinancialRates();
        break;
      case 'reliefweb':
        result = await dataAcquisition.importReliefWebData();
        break;
      case 'hotlines':
        result = await dataAcquisition.importHotlinesFromCSV(source.csvPath || 'hotlines.csv');
        break;
      default:
        return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
