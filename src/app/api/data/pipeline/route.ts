import { NextRequest, NextResponse } from 'next/server';
import { dataPipeline } from '@/lib/data-pipeline';

export async function GET() {
  try {
    const status = dataPipeline.getPipelineStatus();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Failed to get pipeline status:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, pipeline } = await request.json();

    switch (action) {
      case 'run':
        await dataPipeline.runPipeline(pipeline);
        return NextResponse.json({ success: true, message: `Pipeline ${pipeline} started` });
      case 'start':
        await dataPipeline.start();
        return NextResponse.json({ success: true, message: 'All pipelines started' });
      case 'stop':
        await dataPipeline.stop();
        return NextResponse.json({ success: true, message: 'All pipelines stopped' });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pipeline action failed:', error);
    return NextResponse.json({ error: 'Pipeline action failed' }, { status: 500 });
  }
}
