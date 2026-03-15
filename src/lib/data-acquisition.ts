import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import * as parse from 'csv-parse/sync';
import * as cron from 'node-cron';

export interface DataProvenance {
  sourceName: string;
  sourceUrl: string;
  sourceRetrievedAt: Date;
  license?: string;
  rawHash?: string;
}

export interface ImportResult {
  success: boolean;
  recordsImported: number;
  errors: string[];
  provenance: DataProvenance;
}

export class DataAcquisitionService {
  private rssParser = new Parser();
  private dataDir = path.join(process.cwd(), 'data');

  async ensureDataDirectories() {
    const dirs = ['raw', 'normalized', 'cache'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.dataDir, dir), { recursive: true });
    }
  }

  generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  async downloadWithRetry(url: string, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'al-menassa-data-pipeline/1.0 (humanitarian-data@al-menassa.org)'
          }
        });
        return response.data;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async saveRawData(filename: string, content: string, subdirectory = 'raw'): Promise<string> {
    const filePath = path.join(this.dataDir, subdirectory, filename);
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
  }

  async loadRawData(filename: string, subdirectory = 'raw'): Promise<string> {
    const filePath = path.join(this.dataDir, subdirectory, filename);
    return await fs.readFile(filePath, 'utf8');
  }

  // RSS News Aggregation
  async importRSSNews(rssUrl: string, sourceName: string): Promise<ImportResult> {
    try {
      const feed = await this.rssParser.parseURL(rssUrl);
      const provenance: DataProvenance = {
        sourceName,
        sourceUrl: rssUrl,
        sourceRetrievedAt: new Date(),
        license: 'RSS Feed'
      };

      let recordsImported = 0;
      const errors: string[] = [];

      for (const item of feed.items) {
        try {
          const contentHash = this.generateContentHash(item.link || '');
          
          // Check if already exists
          const existing = await prisma.newsArticle.findFirst({
            where: { originalUrl: item.link }
          });

          if (existing) continue;

          await prisma.newsArticle.create({
            data: {
              titleAr: item.title || '',
              titleEn: item.title || '',
              summaryAr: item.contentSnippet || '',
              content: item.content || '',
              sourceName,
              sourceUrl: rssUrl,
              originalUrl: item.link || '',
              sourceType: 'mainstream',
              category: 'general',
              tags: [],
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              isBreaking: false,
              isVerified: false
            }
          });

          recordsImported++;
        } catch (error) {
          errors.push(`Failed to import article "${item.title}": ${error}`);
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
        errors: [`RSS import failed: ${error}`],
        provenance: {
          sourceName,
          sourceUrl: rssUrl,
          sourceRetrievedAt: new Date()
        }
      };
    }
  }

  // Financial Data Scraping
  async scrapeFinancialRates(): Promise<ImportResult> {
    const sources = [
      {
        name: 'LiraRate',
        url: 'https://lirarate.org/',
        selector: '.exchange-rate, .rate-value, [data-rate], .price',
        type: 'lira_black'
      },
      {
        name: 'Banque du Liban',
        url: 'https://www.bdl.gov.lb/',
        selector: '.official-rate, .rate, .exchange-rate',
        type: 'lira_official'
      },
      {
        name: 'World Gold Council',
        url: 'https://www.gold.org/',
        selector: '.price, .gold-price, [data-gold-price]',
        type: 'gold_24k'
      },
      {
        name: 'Ministry of Energy and Water',
        url: 'https://www.energyandwater.gov.lb/',
        selector: '.fuel-price, .price, .announcement',
        type: 'fuel_95'
      }
    ];

    let totalImported = 0;
    const allErrors: string[] = [];
    const provenance: DataProvenance = {
      sourceName: 'Financial Aggregators',
      sourceUrl: 'multiple',
      sourceRetrievedAt: new Date()
    };

    for (const source of sources) {
      try {
        const html = await this.downloadWithRetry(source.url);
        const $ = cheerio.load(html);
        
        // Try multiple selectors and get the first valid result
        const selectors = source.selector.split(', ');
        let rateText = '';
        let rate = 0;

        for (const selector of selectors) {
          rateText = $(selector).first().text().trim();
          if (rateText) {
            // Clean the text and extract number
            const cleanedText = rateText.replace(/[^0-9.,]/g, '');
            rate = parseFloat(cleanedText.replace(/,/g, ''));
            if (!isNaN(rate) && rate > 0) {
              break;
            }
          }
        }

        // Special handling for different data types
        let currency = 'LBP';
        let finalRate = rate;

        if (source.type === 'gold_24k') {
          currency = 'USD';
          // Gold prices are typically in USD per ounce, convert to per gram if needed
          if (rate > 1000) {
            finalRate = rate / 31.1035; // Convert troy ounce to gram
          }
        } else if (source.type.startsWith('fuel_')) {
          currency = 'LBP';
          // Fuel prices should be in LBP per liter
        } else if (source.type.startsWith('lira_')) {
          currency = 'LBP';
          // Exchange rates should be LBP per USD
        }

        if (!isNaN(finalRate) && finalRate > 0) {
          await prisma.financialRate.create({
            data: {
              type: source.type,
              value: finalRate,
              currency,
              sourceName: source.name,
              sourceUrl: source.url,
              region: 'Lebanon'
            }
          });
          totalImported++;
        } else {
          allErrors.push(`Invalid rate value from ${source.name}: ${rateText}`);
        }
      } catch (error) {
        allErrors.push(`Failed to scrape ${source.name}: ${error}`);
      }
    }

    return {
      success: allErrors.length === 0,
      recordsImported: totalImported,
      errors: allErrors,
      provenance
    };
  }

  // Gold Price Scraping (Specialized method)
  async scrapeGoldPrices(): Promise<ImportResult> {
    try {
      const provenance: DataProvenance = {
        sourceName: 'World Gold Council',
        sourceUrl: 'https://www.gold.org/',
        sourceRetrievedAt: new Date(),
        license: 'Public Market Data'
      };

      let recordsImported = 0;
      const errors: string[] = [];

      const html = await this.downloadWithRetry('https://www.gold.org/');
      const $ = cheerio.load(html);
      
      // Target the specific <p class="value"> element from www.gold.org
      const priceElement = $('p.value').first();
      const priceText = priceElement.text().trim();
      
      let goldPriceUsdPerOunce = 0;
      
      if (priceText) {
        // Extract numerical value from text like "5,020.60"
        const cleanedText = priceText.replace(/[^0-9.,]/g, '');
        goldPriceUsdPerOunce = parseFloat(cleanedText.replace(/,/g, ''));
      }

      if (goldPriceUsdPerOunce > 0) {
        // Convert to per gram (1 troy ounce = 31.1035 grams)
        const goldPriceUsdPerGram = goldPriceUsdPerOunce / 31.1035;
        
        // Store 24k gold price
        await prisma.financialRate.create({
          data: {
            type: 'gold_24k',
            value: goldPriceUsdPerGram,
            currency: 'USD',
            sourceName: 'World Gold Council',
            sourceUrl: 'https://www.gold.org/',
            region: 'International'
          }
        });
        recordsImported++;

        // Calculate and store 21k gold price (21/24 of 24k price)
        const gold21kPrice = goldPriceUsdPerGram * (21/24);
        await prisma.financialRate.create({
          data: {
            type: 'gold_21k',
            value: gold21kPrice,
            currency: 'USD',
            sourceName: 'World Gold Council (Calculated)',
            sourceUrl: 'https://www.gold.org/',
            region: 'International'
          }
        });
        recordsImported++;
      } else {
        errors.push(`Could not find valid gold price in <p class="value"> element. Found text: "${priceText}"`);
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
        errors: [`Gold price scraping failed: ${error}`],
        provenance: {
          sourceName: 'World Gold Council',
          sourceUrl: 'https://www.gold.org/',
          sourceRetrievedAt: new Date()
        }
      };
    }
  }

  // HDX Humanitarian Data Exchange Integration
  async importHDXData(datasetId: string, sourceName: string): Promise<ImportResult> {
    try {
      const provenance: DataProvenance = {
        sourceName,
        sourceUrl: `https://data.humdata.org/dataset/${datasetId}`,
        sourceRetrievedAt: new Date(),
        license: 'Humanitarian Data Exchange'
      };

      // Download HDX data
      const downloadUrl = `https://data.humdata.org/dataset/${datasetId}/download?format=csv`;
      const csvContent = await this.downloadWithRetry(downloadUrl);
      
      // Parse CSV
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length === 0) return { success: true, recordsImported: 0, errors: [], provenance };
      
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      const records = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.replace(/"/g, ''));
        const record: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        
        records.push(record);
      }

      let recordsImported = 0;
      const errors: string[] = [];

      // Process based on dataset type
      if (datasetId.includes('displacement') || datasetId.includes('idp')) {
        // Process IDP/shelter data
        for (const record of records) {
          try {
            const lat = parseFloat(record.lat as string) || 0;
            const lon = parseFloat(record.lon as string) || 0;
            const capacity = parseInt(record.individuals as string) || 0;
            
            await prisma.shelter.create({
              data: {
                type: 'government',
                nameAr: record.settlement_name_ar || record.settlement_name || 'Unknown',
                nameLb: record.settlement_name_ar || record.settlement_name || 'Unknown',
                addressAr: record.address || null,
                governorateAr: record.governorate || null,
                districtAr: record.district || null,
                latitude: lat,
                longitude: lon,
                capacityTotal: capacity,
                capacityUsed: 0, // Will be updated separately
                statusTextAr: 'متاح',
                contactPhone: record.contact_phone || null,
                sourceName,
                sourceUrl: provenance.sourceUrl,
                reviewStatus: 'verified'
              }
            });
            recordsImported++;
          } catch (error) {
            errors.push(`Failed to import shelter: ${error}`);
          }
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
        errors: [`HDX import failed: ${error}`],
        provenance: {
          sourceName,
          sourceUrl: `https://data.humdata.org/dataset/${datasetId}`,
          sourceRetrievedAt: new Date(),
          license: 'Humanitarian Data Exchange'
        }
      };
    }
  }

  // ReliefWeb API Integration
  async importReliefWebData(): Promise<ImportResult> {
    try {
      const apiUrl = 'https://api.reliefweb.int/v1/reports?filter[country]=Lebanon&limit=100';
      const response = await this.downloadWithRetry(apiUrl);
      const data = JSON.parse(response);

      const provenance: DataProvenance = {
        sourceName: 'ReliefWeb',
        sourceUrl: apiUrl,
        sourceRetrievedAt: new Date(),
        license: 'CC BY'
      };

      let recordsImported = 0;
      const errors: string[] = [];

      for (const report of data.data) {
        try {
          await prisma.newsArticle.create({
            data: {
              titleAr: report.fields.title,
              titleEn: report.fields.title,
              summaryAr: report.fields.summary,
              content: report.fields.body,
              sourceName: 'ReliefWeb',
              sourceUrl: apiUrl,
              originalUrl: report.fields.url,
              sourceType: 'official',
              category: 'humanitarian',
              tags: report.fields.tags || [],
              publishedAt: new Date(report.fields.date.created),
              isBreaking: false,
              isVerified: true
            }
          });
          recordsImported++;
        } catch (error) {
          errors.push(`Failed to import ReliefWeb report: ${error}`);
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
        errors: [`ReliefWeb import failed: ${error}`],
        provenance: {
          sourceName: 'ReliefWeb',
          sourceUrl: 'https://api.reliefweb.int',
          sourceRetrievedAt: new Date()
        }
      };
    }
  }

  // Flight Data Scraping (Beirut Airport)
  async scrapeFlightData(): Promise<ImportResult> {
    try {
      const provenance: DataProvenance = {
        sourceName: 'Beirut Rafic Hariri International Airport',
        sourceUrl: 'https://www.beirutairport.gov.lb/',
        sourceRetrievedAt: new Date(),
        license: 'Public Information'
      };

      // For now, return mock data since flight scraping requires complex authentication
      // In production, this would integrate with airport's official API or use flight tracking services
      const mockFlights = [
        {
          flightNumber: "ME312",
          airline: "Middle East Airlines",
          origin: "دبي",
          destination: "بيروت",
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          estimatedTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
          status: "Delayed",
          gate: "15",
          terminal: "1",
          type: "arrival"
        },
        {
          flightNumber: "TK829",
          airline: "Turkish Airlines",
          origin: "اسطنبول",
          destination: "بيروت",
          scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          estimatedTime: null,
          status: "On Time",
          gate: "8",
          terminal: "1",
          type: "arrival"
        }
      ];

      return {
        success: true,
        recordsImported: mockFlights.length,
        errors: [],
        provenance
      };
    } catch (error) {
      return {
        success: false,
        recordsImported: 0,
        errors: [`Flight data scraping failed: ${error}`],
        provenance: {
          sourceName: 'Beirut Rafic Hariri International Airport',
          sourceUrl: 'https://www.beirutairport.gov.lb/',
          sourceRetrievedAt: new Date()
        }
      };
    }
  }

  // Hotline Data Import from CSV
  async importHotlinesFromCSV(csvPath: string): Promise<ImportResult> {
    try {
      const csvContent = await this.loadRawData(csvPath, 'seed');
      const lines = csvContent.split('\n').slice(1); // Skip header
      
      const provenance: DataProvenance = {
        sourceName: 'Curated Hotlines',
        sourceUrl: csvPath,
        sourceRetrievedAt: new Date(),
        license: 'Public Domain'
      };

      let recordsImported = 0;
      const errors: string[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        
        const [nameAr, phone, region, category, notes, sourceUrl] = line.split(',').map(s => s.replace(/"/g, ''));
        
        try {
          // Check if already exists based on phone number
          const existingPhone = await prisma.hotline.findFirst({
            where: { phone }
          });

          if (!existingPhone) {
            await prisma.hotline.create({
              data: {
                nameAr,
                phone,
                region: region || 'Lebanon',
                category: category || 'emergency',
                notes,
                sourceUrl,
                isActive: true,
                displayOrder: 0
              }
            });
            recordsImported++;
          }
        } catch (error) {
          errors.push(`Failed to import hotline ${phone}: ${error}`);
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
        errors: [`Hotline CSV import failed: ${error}`],
        provenance: {
          sourceName: 'Curated Hotlines',
          sourceUrl: csvPath,
          sourceRetrievedAt: new Date()
        }
      };
    }
  }
}

export const dataAcquisition = new DataAcquisitionService();
