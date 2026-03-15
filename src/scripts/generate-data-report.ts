#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

async function generateDataReport() {
  try {
    console.log('📊 Generating comprehensive data report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      database: {
        shelters: await getDataCount('shelter', { reviewStatus: 'verified' }),
        hotlines: await getDataCount('hotline', { isActive: true }),
        news: await getDataCount('newsArticle'),
        threats: await getDataCount('threat', { status: { not: 'false_alarm' } }),
        housing: await getDataCount('housing', { isAvailable: true, verified: true }),
        helpPosts: await getDataCount('helpPost', { status: 'active' }),
        alerts: await getDataCount('alert'),
        financialRates: await getFinancialRatesBreakdown()
      },
      dataQuality: {
        verifiedShelters: await getDataCount('shelter', { reviewStatus: 'verified' }),
        pendingShelters: await getDataCount('shelter', { reviewStatus: 'pending' }),
        verifiedNews: await getDataCount('newsArticle', { isVerified: true }),
        breakingNews: await getDataCount('newsArticle', { isBreaking: true })
      },
      recentActivity: {
        newsLast24h: await getRecentCount('newsArticle', 24),
        threatsLast24h: await getRecentCount('threat', 24),
        reportsLast24h: await getRecentCount('report', 24)
      },
      sources: {
        rssSources: await getRSSSourceCount(),
        financialSources: await getFinancialSourceCount()
      }
    };
    
    // Save detailed report
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'detailed-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Generate summary for CI/CD
    const summary = {
      totalRecords: Object.values(report.database).reduce((sum, val) => {
        return sum + (typeof val === 'number' ? val : Array.isArray(val) ? val.length : 0);
      }, 0),
      verifiedContent: report.dataQuality.verifiedShelters + report.dataQuality.verifiedNews,
      recentActivity: Object.values(report.recentActivity).reduce((sum, val) => sum + val, 0),
      timestamp: report.timestamp
    };
    
    console.log('📈 Data Report Summary:');
    console.log(`   Total Records: ${summary.totalRecords}`);
    console.log(`   Verified Content: ${summary.verifiedContent}`);
    console.log(`   Last 24h Activity: ${summary.recentActivity}`);
    
    console.log('\n📊 Detailed breakdown:');
    console.log(`   Shelters: ${report.database.shelters}`);
    console.log(`   Hotlines: ${report.database.hotlines}`);
    console.log(`   News Articles: ${report.database.news}`);
    console.log(`   Threats: ${report.database.threats}`);
    console.log(`   Housing: ${report.database.housing}`);
    console.log(`   Help Posts: ${report.database.helpPosts}`);
    console.log(`   Financial Rate Types: ${report.database.financialRates.length}`);
    
    process.stdout.write(JSON.stringify(summary));
    
  } catch (error) {
    console.error('❌ Failed to generate data report:', error);
    process.exit(1);
  }
}

async function getDataCount(model: string, where?: any) {
  try {
    const result = await (prisma as any)[model].count({ where });
    return result;
  } catch (error) {
    console.warn(`Warning: Could not count ${model}:`, error);
    return 0;
  }
}

async function getRecentCount(model: string, hours: number) {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const result = await (prisma as any)[model].count({
      where: { createdAt: { gte: since } }
    });
    return result;
  } catch (error) {
    console.warn(`Warning: Could not count recent ${model}:`, error);
    return 0;
  }
}

async function getFinancialRatesBreakdown() {
  try {
    const result = await prisma.financialRate.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    return result.map(r => ({ type: r.type, count: r._count.type }));
  } catch (error) {
    console.warn('Warning: Could not get financial rates breakdown:', error);
    return [];
  }
}

async function getRSSSourceCount() {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'seed', 'rss_sources.csv');
    const content = await fs.readFile(csvPath, 'utf8');
    return content.split('\n').filter(line => line.trim()).length - 1; // Subtract header
  } catch (error) {
    console.warn('Warning: Could not count RSS sources:', error);
    return 0;
  }
}

async function getFinancialSourceCount() {
  try {
    const result = await prisma.financialRate.groupBy({
      by: ['sourceName'],
      _count: { sourceName: true }
    });
    return result.length;
  } catch (error) {
    console.warn('Warning: Could not count financial sources:', error);
    return 0;
  }
}

// Run the script
if (require.main === module) {
  generateDataReport();
}
