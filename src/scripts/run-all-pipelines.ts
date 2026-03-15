#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

import { dataPipeline } from '../lib/data-pipeline';
import { dataAcquisition } from '../lib/data-acquisition';
import { osmImport } from '../lib/osm-import';

async function runAllPipelines() {
  console.log('🚀 Starting all data pipelines...');
  
  try {
    // Start the pipeline scheduler
    await dataPipeline.start();
    
    // Wait a moment for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run each pipeline manually
    const pipelines = ['rss-news', 'financial-rates', 'reliefweb', 'osm-import', 'hotlines-seed'];
    
    for (const pipelineName of pipelines) {
      console.log(`\n📊 Running pipeline: ${pipelineName}`);
      try {
        await dataPipeline.runPipeline(pipelineName);
        console.log(`✅ Pipeline ${pipelineName} completed successfully`);
      } catch (error) {
        console.error(`❌ Pipeline ${pipelineName} failed:`, error);
      }
    }
    
    console.log('\n🎉 All pipelines completed!');
    
    // Generate summary report
    await generateSummaryReport();
    
  } catch (error) {
    console.error('💥 Pipeline execution failed:', error);
    process.exit(1);
  } finally {
    await dataPipeline.stop();
  }
}

async function generateSummaryReport() {
  try {
    console.log('\n📈 Generating data summary report...');
    
    // Get counts from each data type
    const [
      sheltersCount,
      hotlinesCount,
      newsCount,
      threatsCount,
      financialCount
    ] = await Promise.all([
      prisma.shelter.count({ where: { reviewStatus: 'verified' } }),
      prisma.hotline.count({ where: { isActive: true } }),
      prisma.newsArticle.count(),
      prisma.threat.count({ where: { status: { not: 'false_alarm' } } }),
      prisma.financialRate.groupBy({ by: ['type'] })
    ]);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        shelters: sheltersCount,
        hotlines: hotlinesCount,
        news: newsCount,
        threats: threatsCount,
        financialRates: financialCount.length
      },
      financialBreakdown: financialCount,
      lastUpdated: new Date().toISOString()
    };
    
    // Save report
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'summary-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('📊 Summary report generated:', report);
    
  } catch (error) {
    console.error('❌ Failed to generate summary report:', error);
  }
}

// Import required modules
import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Run the script
if (require.main === module) {
  runAllPipelines()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
