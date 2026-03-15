/* eslint-disable @typescript-eslint/no-explicit-any */
import { dataAcquisition } from '@/lib/data-acquisition';
import { osmImport } from '@/lib/osm-import';
import * as cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';

interface PipelineConfig {
  name: string;
  schedule: string;
  enabled: boolean;
  handler: () => Promise<void>;
}

class DataPipelineScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private logsDir = path.join(process.cwd(), 'data', 'logs');

  async ensureLogsDirectory() {
    await fs.mkdir(this.logsDir, { recursive: true });
  }

  async logPipelineRun(pipelineName: string, result: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      pipeline: pipelineName,
      success: result.success,
      recordsImported: result.recordsImported,
      errors: result.errors,
      provenance: result.provenance
    };

    const logFile = path.join(this.logsDir, `${pipelineName}.jsonl`);
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }

  private pipelines: PipelineConfig[] = [
    {
      name: 'hdx-shelters',
      schedule: '0 */6 * * *', // Every 6 hours
      enabled: true,
      handler: async () => {
        console.log('Running HDX shelter data import...');
        try {
          const result = await dataAcquisition.importHDXData('18ee4ec4-b90a-453a-91d5-a86053eba096', 'HDX Lebanon Displacement');
          await this.logPipelineRun('hdx-shelters', result);
          console.log(`HDX Shelters: ${result.recordsImported} records imported`);
        } catch (error) {
          console.error('HDX shelters failed:', error);
        }
      },
    },
    {
      name: 'rss-news',
      schedule: '*/30 * * * *', // Every 30 minutes
      enabled: true,
      handler: async () => {
        console.log('Running RSS news aggregation...');
        const rssSources = await this.loadRSSSources();
        
        for (const source of rssSources) {
          try {
            const result = await dataAcquisition.importRSSNews(source.rss_url, source.source_name);
            await this.logPipelineRun(`rss-${source.source_name}`, result);
            console.log(`RSS ${source.source_name}: ${result.recordsImported} articles imported`);
          } catch (error) {
            console.error(`RSS ${source.source_name} failed:`, error);
          }
        }
      }
    },
    {
      name: 'financial-rates',
      schedule: '0 */2 * * *', // Every 2 hours
      enabled: true,
      handler: async () => {
        console.log('Running financial rates scrape...');
        try {
          const result = await dataAcquisition.scrapeFinancialRates();
          await this.logPipelineRun('financial-rates', result);
          console.log(`Financial rates: ${result.recordsImported} records imported`);
        } catch (error) {
          console.error('Financial rates scrape failed:', error);
        }
      }
    },
    {
      name: 'reliefweb',
      schedule: '0 */6 * * *', // Every 6 hours
      enabled: true,
      handler: async () => {
        console.log('Running ReliefWeb import...');
        try {
          const result = await dataAcquisition.importReliefWebData();
          await this.logPipelineRun('reliefweb', result);
          console.log(`ReliefWeb: ${result.recordsImported} reports imported`);
        } catch (error) {
          console.error('ReliefWeb import failed:', error);
        }
      }
    },
    {
      name: 'gold-prices',
      schedule: '0 */1 * * *', // Every hour
      enabled: true,
      handler: async () => {
        console.log('Running gold price scrape...');
        try {
          const result = await dataAcquisition.scrapeGoldPrices();
          await this.logPipelineRun('gold-prices', result);
          console.log(`Gold prices: ${result.recordsImported} records imported`);
        } catch (error) {
          console.error('Gold price scrape failed:', error);
        }
      }
    },
    {
      name: 'osm-import',
      schedule: '0 2 * * *', // Daily at 2 AM
      enabled: true,
      handler: async () => {
        console.log('Running OSM data import...');
        try {
          const result = await osmImport.runFullImport();
          await this.logPipelineRun('osm-import', result);
          console.log(`OSM import: ${result.recordsImported} facilities imported`);
        } catch (error) {
          console.error('OSM import failed:', error);
        }
      }
    },
    {
      name: 'flights-data',
      schedule: '*/5 * * * *', // Every 5 minutes
      enabled: true,
      handler: async () => {
        console.log('Running flight data update...');
        try {
          const result = await dataAcquisition.scrapeFlightData();
          await this.logPipelineRun('flights-data', result);
          console.log(`Flights: ${result.recordsImported} records updated`);
        } catch (error) {
          console.error('Flights data update failed:', error);
        }
      }
    },
    {
      name: 'hotlines-seed',
      schedule: '0 0 * * *', // Daily at midnight
      enabled: true,
      handler: async () => {
        console.log('Running hotlines seed...');
        try {
          const result = await dataAcquisition.importHotlinesFromCSV('hotlines.csv');
          await this.logPipelineRun('hotlines-seed', result);
          console.log(`Hotlines: ${result.recordsImported} records imported`);
        } catch (error) {
          console.error('Hotlines seed failed:', error);
        }
      }
    }
  ];

  private async loadRSSSources(): Promise<Array<{
    source_name: string;
    rss_url: string;
    homepage_url: string;
    language: string;
    category: string;
  }>> {
    try {
      const csvPath = path.join(process.cwd(), 'data', 'seed', 'rss_sources.csv');
      const csvContent = await fs.readFile(csvPath, 'utf8');
      const lines = csvContent.split('\n').slice(1);
      
      return lines
        .filter(line => line.trim())
        .map(line => {
          const [source_name, language, country, category, rss_url, homepage_url] = 
            line.split(',').map(s => s.replace(/"/g, ''));
          return { source_name, rss_url, homepage_url, language, category };
        })
        .filter(source => source.rss_url && source.rss_url !== '');
    } catch (error) {
      console.error('Failed to load RSS sources:', error);
      return [];
    }
  }

  async start() {
    await this.ensureLogsDirectory();
    await dataAcquisition.ensureDataDirectories();

    console.log('Starting data pipeline scheduler...');

    for (const pipeline of this.pipelines) {
      if (pipeline.enabled) {
        console.log(`Scheduling pipeline: ${pipeline.name} (${pipeline.schedule})`);
        
        const task = cron.schedule(pipeline.schedule, async () => {
          console.log(`Executing pipeline: ${pipeline.name}`);
          try {
            await pipeline.handler();
          } catch (error) {
            console.error(`Pipeline ${pipeline.name} failed:`, error);
          }
        });

        this.jobs.set(pipeline.name, task);
      }
    }

    console.log(`Started ${this.jobs.size} data pipelines`);
  }

  async stop() {
    console.log('Stopping data pipeline scheduler...');
    
    for (const [name, task] of this.jobs) {
      task.stop();
      console.log(`Stopped pipeline: ${name}`);
    }
    
    this.jobs.clear();
  }

  async runPipeline(pipelineName: string) {
    const pipeline = this.pipelines.find(p => p.name === pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineName}`);
    }

    console.log(`Manually running pipeline: ${pipelineName}`);
    await pipeline.handler();
  }

  getPipelineStatus() {
    return {
      total: this.pipelines.length,
      running: this.jobs.size,
      pipelines: this.pipelines.map(p => ({
        name: p.name,
        schedule: p.schedule,
        enabled: p.enabled,
        running: this.jobs.has(p.name)
      }))
    };
  }
}

export const dataPipeline = new DataPipelineScheduler();

// Start the pipeline when this module is imported
if (process.env.NODE_ENV !== 'test') {
  dataPipeline.start().catch(console.error);
}
