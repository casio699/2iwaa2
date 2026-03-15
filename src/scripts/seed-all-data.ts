#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { dataAcquisition } from '../lib/data-acquisition';
import { osmImport } from '../lib/osm-import';
import { seedFinancialData } from '../app/api/financial/seed';

async function seedAllData() {
  console.log('🌱 Starting comprehensive data seeding...');
  
  try {
    // Ensure data directories exist
    await dataAcquisition.ensureDataDirectories();
    
    // 1. Seed hotlines from CSV
    console.log('\n📞 Seeding hotlines...');
    const hotlinesResult = await dataAcquisition.importHotlinesFromCSV('hotlines.csv');
    console.log(`✅ Hotlines: ${hotlinesResult.recordsImported} imported`);
    
    // 2. Seed financial data
    console.log('\n💰 Seeding financial data...');
    await seedFinancialData();
    console.log('✅ Financial data seeded');
    
    // 3. Import RSS news (initial batch)
    console.log('\n📰 Importing RSS news...');
    const rssSources = await loadRSSSources();
    let totalNews = 0;
    
    for (const source of rssSources.slice(0, 3)) { // Limit to first 3 sources for initial seed
      try {
        const result = await dataAcquisition.importRSSNews(source.rss_url, source.source_name);
        totalNews += result.recordsImported;
        console.log(`✅ ${source.source_name}: ${result.recordsImported} articles`);
      } catch (error) {
        console.error(`❌ ${source.source_name} failed:`, error);
      }
    }
    
    // 4. Import ReliefWeb data
    console.log('\n🆘 Importing ReliefWeb data...');
    const reliefResult = await dataAcquisition.importReliefWebData();
    console.log(`✅ ReliefWeb: ${reliefResult.recordsImported} reports`);
    
    // 5. OSM import (optional - can be resource intensive)
    console.log('\n🗺️ Starting OSM import (this may take a while)...');
    let osmResult: any = null;
    try {
      osmResult = await osmImport.runFullImport();
      console.log(`✅ OSM: ${osmResult.recordsImported} facilities`);
    } catch (error) {
      console.warn('⚠️ OSM import failed (optional):', error);
    }
    
    // Generate summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Hotlines: ${hotlinesResult.recordsImported}`);
    console.log(`   News Articles: ${totalNews + reliefResult.recordsImported}`);
    console.log(`   Financial Rates: Seeded`);
    console.log(`   OSM Facilities: ${osmResult ? 'Imported' : 'Skipped'}`);
    
    console.log('\n🎉 Data seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Data seeding failed:', error);
    process.exit(1);
  }
}

async function loadRSSSources() {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    const csvPath = path.join(process.cwd(), 'data', 'seed', 'rss_sources.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const lines = csvContent.split('\n').slice(1);
    
    return lines
      .filter(line => line.trim())
      .map(line => {
        const [source_name, language,, category, rss_url, homepage_url] = 
          line.split(',').map(s => s.replace(/"/g, ''));
        return { source_name, rss_url, homepage_url, language, category };
      })
      .filter(source => source.rss_url && source.rss_url !== '');
  } catch (error) {
    console.error('Failed to load RSS sources:', error);
    return [];
  }
}

// Run the script
if (require.main === module) {
  seedAllData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
