#!/usr/bin/env tsx

import { dataPipeline } from '../lib/data-pipeline';

async function runSinglePipeline() {
  const pipelineName = process.argv[2];
  
  if (!pipelineName) {
    console.error('❌ Please specify a pipeline name');
    console.log('Usage: npm run pipeline:single <pipeline-name>');
    console.log('Available pipelines: rss-news, financial-rates, reliefweb, osm-import, hotlines-seed');
    process.exit(1);
  }
  
  console.log(`🚀 Starting pipeline: ${pipelineName}`);
  
  try {
    await dataPipeline.start();
    
    // Wait a moment for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run the specific pipeline
    await dataPipeline.runPipeline(pipelineName);
    
    console.log(`✅ Pipeline ${pipelineName} completed successfully`);
    
  } catch (error) {
    console.error(`❌ Pipeline ${pipelineName} failed:`, error);
    process.exit(1);
  } finally {
    await dataPipeline.stop();
  }
}

// Run the script
if (require.main === module) {
  runSinglePipeline();
}
