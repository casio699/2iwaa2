#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

async function importRealShelters() {
  try {
    console.log('🏠 Importing real shelter data...');
    
    // Read the real shelters CSV
    const csvPath = path.join(process.cwd(), 'data', 'seed', 'real_shelters.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    
    // Parse CSV manually
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    let recordsImported = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.replace(/"/g, ''));
      
      try {
        await prisma.shelter.create({
          data: {
            type: 'government',
            nameAr: values[0],
            addressAr: values[1],
            governorateAr: values[2],
            districtAr: values[3],
            latitude: parseFloat(values[4]) || 0,
            longitude: parseFloat(values[5]) || 0,
            capacityTotal: parseInt(values[6]) || 0,
            capacityUsed: parseInt(values[7]) || 0,
            statusTextAr: values[8],
            contactPhone: values[9],
            sourceName: values[10],
            sourceUrl: values[11],
            reviewStatus: 'verified'
          }
        });
        recordsImported++;
        console.log(`✅ Imported: ${values[0]}`);
      } catch (error) {
        console.error(`❌ Failed to import: ${values[0]}`, error);
      }
    }
    
    console.log(`🎉 Successfully imported ${recordsImported} real shelters`);
    return recordsImported;
  } catch (error) {
    console.error('Failed to import real shelters:', error);
    return 0;
  }
}

// Run the import
importRealShelters();
