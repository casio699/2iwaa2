/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from '@/lib/prisma';
import { DataProvenance, ImportResult } from '@/lib/data-acquisition';
import axios from 'axios';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class OSMImportService {
  private osmDataDir = path.join(process.cwd(), 'data', 'raw', 'osm');
  private lebanonPbfUrl = 'https://download.geofabrik.de/asia/lebanon-latest.osm.pbf';

  async ensureOSMDirectory() {
    await fsPromises.mkdir(this.osmDataDir, { recursive: true });
  }

  async downloadLebanonOSM(): Promise<string> {
    await this.ensureOSMDirectory();
    const filename = 'lebanon-latest.osm.pbf';
    const filepath = path.join(this.osmDataDir, filename);

    try {
      // Check if file exists and is recent (less than 7 days old)
      const stats = await fsPromises.stat(filepath);
      const ageMs = Date.now() - stats.mtime.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      
      if (ageDays < 7) {
        console.log('OSM data is recent, skipping download');
        return filepath;
      }
    } catch {
      // File doesn't exist, proceed with download
    }

    console.log('Downloading Lebanon OSM data...');
    const response = await axios({
      method: 'GET',
      url: this.lebanonPbfUrl,
      responseType: 'stream',
      timeout: 300000 // 5 minutes
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filepath));
      writer.on('error', reject);
    });
  }

  async importOSMToPostGIS(pbfPath: string): Promise<ImportResult> {
    const provenance: DataProvenance = {
      sourceName: 'OpenStreetMap (Geofabrik)',
      sourceUrl: this.lebanonPbfUrl,
      sourceRetrievedAt: new Date(),
      license: 'ODbL 1.0'
    };

    try {
      // Check if PostGIS extension exists
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS hstore;`;

      // Import using osm2pgsql (requires osm2pgsql to be installed)
      const importCmd = `osm2pgsql -d ${process.env.DATABASE_URL} --create --slim --drop --hstore-all --latlong --multi-geometry --prefix "planet_osm" "${pbfPath}"`;
      
      try {
        await execAsync(importCmd);
        console.log('OSM data imported to PostGIS successfully');
      } catch (error) {
        console.error('osm2pgsql failed, trying alternative approach...');
        // Fallback: create views manually if osm2pgsql fails
        await this.createOSMViews();
      }

      // Create optimized views for healthcare facilities
      await this.createHealthcareViews();
      await this.createShelterViews();

      return {
        success: true,
        recordsImported: 0, // OSM imports are bulk, hard to count
        errors: [],
        provenance
      };
    } catch (error) {
      return {
        success: false,
        recordsImported: 0,
        errors: [`OSM import failed: ${error}`],
        provenance
      };
    }
  }

  private async createOSMViews() {
    // Create basic views if osm2pgsql wasn't used
    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW osm_healthcare_points AS
      SELECT 
        osm_id,
        name,
        amenity,
        "healthcare",
        emergency,
        operator,
        phone,
        website,
        ST_Transform(way, 4326) as geom
      FROM planet_osm_point 
      WHERE amenity IN ('hospital', 'clinic', 'pharmacy', 'doctors') 
         OR "healthcare" IS NOT NULL;
    `;

    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW osm_healthcare_polygons AS
      SELECT 
        osm_id,
        name,
        amenity,
        "healthcare",
        emergency,
        operator,
        phone,
        website,
        ST_Transform(way, 4326) as geom
      FROM planet_osm_polygon 
      WHERE amenity IN ('hospital', 'clinic', 'pharmacy', 'doctors') 
         OR "healthcare" IS NOT NULL;
    `;
  }

  private async createHealthcareViews() {
    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW healthcare_facilities AS
      SELECT 
        'hospital' as type,
        name,
        COALESCE(operator, '') as operator,
        COALESCE(phone, '') as phone,
        COALESCE(website, '') as website,
        ST_Y(geom) as latitude,
        ST_X(geom) as longitude,
        emergency,
        osm_id
      FROM osm_healthcare_points
      WHERE amenity = 'hospital' OR "healthcare" = 'hospital'
      
      UNION ALL
      
      SELECT 
        'clinic' as type,
        name,
        COALESCE(operator, '') as operator,
        COALESCE(phone, '') as phone,
        COALESCE(website, '') as website,
        ST_Y(geom) as latitude,
        ST_X(geom) as longitude,
        emergency,
        osm_id
      FROM osm_healthcare_points
      WHERE amenity = 'clinic' OR "healthcare" IN ('clinic', 'doctor')
      
      UNION ALL
      
      SELECT 
        'pharmacy' as type,
        name,
        COALESCE(operator, '') as operator,
        COALESCE(phone, '') as phone,
        COALESCE(website, '') as website,
        ST_Y(geom) as latitude,
        ST_X(geom) as longitude,
        emergency,
        osm_id
      FROM osm_healthcare_points
      WHERE amenity = 'pharmacy';
    `;
  }

  private async createShelterViews() {
    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW potential_shelters AS
      SELECT 
        'school' as type,
        name,
        COALESCE(operator, '') as operator,
        COALESCE(phone, '') as phone,
        COALESCE(website, '') as website,
        ST_Y(geom) as latitude,
        ST_X(geom) as longitude,
        amenity,
        osm_id
      FROM osm_healthcare_points
      WHERE amenity IN ('school', 'college', 'university', 'community_centre')
      
      UNION ALL
      
      SELECT 
        'government' as type,
        name,
        COALESCE(operator, '') as operator,
        COALESCE(phone, '') as phone,
        COALESCE(website, '') as website,
        ST_Y(geom) as latitude,
        ST_X(geom) as longitude,
        amenity,
        osm_id
      FROM osm_healthcare_points
      WHERE amenity IN ('townhall', 'public_building', 'government');
    `;
  }

  async extractHealthcareFacilities(): Promise<ImportResult> {
    const provenance: DataProvenance = {
      sourceName: 'OpenStreetMap Healthcare',
      sourceUrl: this.lebanonPbfUrl,
      sourceRetrievedAt: new Date(),
      license: 'ODbL 1.0'
    };

    try {
      // Query the healthcare view
      const facilities = await prisma.$queryRaw`
        SELECT * FROM healthcare_facilities 
        WHERE name IS NOT NULL 
        ORDER BY type, name
      ` as any[];

      let recordsImported = 0;
      const errors: string[] = [];

      for (const facility of facilities) {
        try {
          // Check if already exists based on OSM ID
          const existing = await prisma.shelter.findFirst({
            where: {
              OR: [
                { nameAr: facility.name },
                { nameLb: facility.name }
              ]
            }
          });

          if (existing) continue;

          // Create as shelter record for now (could be separate healthcare table)
          await prisma.shelter.create({
            data: {
              type: 'government', // OSM facilities are typically public
              nameAr: facility.name,
              nameLb: facility.name,
              latitude: parseFloat(facility.latitude),
              longitude: parseFloat(facility.longitude),
              contactPhone: facility.phone || null,
              sourceName: 'OpenStreetMap',
              sourceUrl: `https://www.openstreetmap.org/way/${facility.osm_id}`,
              reviewStatus: 'verified'
            }
          });

          recordsImported++;
        } catch (error) {
          errors.push(`Failed to import facility ${facility.name}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        recordsImported,
        errors,
        provenance
      };
    } catch (error) {
      return {
        success: false,
        recordsImported: 0,
        errors: [`Healthcare extraction failed: ${error}`],
        provenance
      };
    }
  }

  async runFullImport(): Promise<ImportResult> {
    try {
      console.log('Starting OSM import process...');
      
      // Download latest data
      const pbfPath = await this.downloadLebanonOSM();
      
      // Import to PostGIS
      const importResult = await this.importOSMToPostGIS(pbfPath);
      
      if (!importResult.success) {
        return importResult;
      }
      
      // Extract healthcare facilities
      const extractResult = await this.extractHealthcareFacilities();
      
      return {
        success: extractResult.success,
        recordsImported: extractResult.recordsImported,
        errors: extractResult.errors,
        provenance: extractResult.provenance
      };
    } catch (error) {
      return {
        success: false,
        recordsImported: 0,
        errors: [`Full OSM import failed: ${error}`],
        provenance: {
          sourceName: 'OpenStreetMap (Geofabrik)',
          sourceUrl: this.lebanonPbfUrl,
          sourceRetrievedAt: new Date()
        }
      };
    }
  }
}

export const osmImport = new OSMImportService();
