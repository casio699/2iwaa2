/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { dataValidation } from '@/lib/data-validation';
import { monitoring } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('type');
    const recordId = searchParams.get('id');

    if (entityType && recordId) {
      // Validate single record
      const record = await getRecord(entityType, recordId);
      if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      const result = await dataValidation.validateRecord(entityType, record, recordId);
      return NextResponse.json({ success: true, result });
    } else if (entityType) {
      // Validate all records of type
      const results = await dataValidation.validateAllRecords(entityType);
      return NextResponse.json({ success: true, results, entityType });
    } else {
      // Generate full data quality report
      const report = await dataValidation.generateDataQualityReport();
      const reportPath = await dataValidation.saveValidationReport(report);
      
      return NextResponse.json({ 
        success: true, 
        report,
        reportPath,
        summary: {
          totalEntities: report.summary.totalEntities,
          validRecords: report.summary.validRecords,
          invalidRecords: report.summary.invalidRecords,
          warnings: report.summary.warnings
        }
      });
    }
  } catch (error) {
    console.error('Validation API error:', error);
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
    console.error('Validation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getRecord(entityType: string, recordId: string) {
  const { prisma } = await import('@/lib/prisma');
  
  try {
    return await (prisma as any)[entityType].findUnique({
      where: { id: recordId }
    });
  } catch (error) {
    return null;
  }
}
