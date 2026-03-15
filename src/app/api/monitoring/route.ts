/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'summary':
        return NextResponse.json({
          success: true,
          data: monitoring.getMonitoringSummary()
        });
      
      case 'alerts':
        const activeOnly = searchParams.get('active') === 'true';
        const alerts = activeOnly ? monitoring.getActiveAlerts() : monitoring.getAllAlerts();
        return NextResponse.json({
          success: true,
          data: alerts
        });
      
      case 'rules':
        return NextResponse.json({
          success: true,
          data: monitoring.getAlertRules()
        });
      
      default:
        return NextResponse.json({
          success: true,
          data: {
            summary: monitoring.getMonitoringSummary(),
            activeAlerts: monitoring.getActiveAlerts().slice(0, 10),
            rules: monitoring.getAlertRules()
          }
        });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, alertId, ruleId, updates } = await request.json();

    switch (action) {
      case 'resolve-alert':
        if (!alertId) {
          return NextResponse.json({ error: 'alertId required' }, { status: 400 });
        }
        const resolved = await monitoring.resolveAlert(alertId);
        return NextResponse.json({ 
          success: true, 
          resolved 
        });
      
      case 'update-rule':
        if (!ruleId || !updates) {
          return NextResponse.json({ error: 'ruleId and updates required' }, { status: 400 });
        }
        const updated = await monitoring.updateAlertRule(ruleId, updates);
        return NextResponse.json({ 
          success: true, 
          updated 
        });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
