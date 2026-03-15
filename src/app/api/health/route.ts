export async function GET() {
  try {
    // Simple health check without heavy initialization
    return Response.json({ 
      status: 'healthy',
      services: {
        pipeline: 'ready',
        cache: 'ready'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
