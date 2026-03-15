/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export interface ValidationRule {
  name: string;
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: unknown) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    recordId: string;
    entityType: string;
    validatedAt: Date;
    rules: string[];
  };
}

export class DataValidationService {
  private validationRules: Map<string, ValidationRule[]> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Shelter validation rules
    this.validationRules.set('shelter', [
      { name: 'name_required', field: 'nameAr', required: true, type: 'string', minLength: 2 },
      { name: 'coordinates_required', field: 'latitude', required: true, type: 'number', min: -90, max: 90 },
      { name: 'longitude_required', field: 'longitude', required: true, type: 'number', min: -180, max: 180 },
      { name: 'type_valid', field: 'type', required: true, enum: ['government', 'ngo', 'municipality', 'civilian', 'hotel'] },
      { name: 'phone_format', field: 'contactPhone', type: 'string', pattern: /^[\d\s\-\+\(\)]+$/ }
    ]);

    // Hotline validation rules
    this.validationRules.set('hotline', [
      { name: 'name_required', field: 'nameAr', required: true, type: 'string', minLength: 2 },
      { name: 'phone_required', field: 'phone', required: true, type: 'string', pattern: /^[\d\s\-\+\(\)]+$/ },
      { name: 'category_valid', field: 'category', required: true, enum: ['emergency', 'medical', 'police', 'fire', 'customs', 'military', 'traffic', 'tourism'] }
    ]);

    // News validation rules
    this.validationRules.set('newsArticle', [
      { name: 'title_required', field: 'titleAr', required: true, type: 'string', minLength: 5 },
      { name: 'source_required', field: 'sourceName', required: true, type: 'string', minLength: 2 },
      { name: 'url_valid', field: 'originalUrl', type: 'string', pattern: /^https?:\/\/.+/ },
      { name: 'category_valid', field: 'category', enum: ['threat', 'shelter', 'humanitarian', 'general', 'financial'] }
    ]);

    // Financial rate validation rules
    this.validationRules.set('financialRate', [
      { name: 'type_required', field: 'type', required: true, enum: ['lira_official', 'lira_black', 'lira_sayrafa', 'fuel_95', 'fuel_98', 'fuel_diesel', 'gold_24k', 'gold_21k'] },
      { name: 'value_positive', field: 'value', required: true, type: 'number', min: 0 },
      { name: 'currency_valid', field: 'currency', required: true, enum: ['LBP', 'USD', 'EUR'] }
    ]);

    // Threat validation rules
    this.validationRules.set('threat', [
      { name: 'type_required', field: 'type', required: true, enum: ['rocket', 'airstrike', 'shelling', 'border_clash', 'drone', 'naval', 'ground'] },
      { name: 'coordinates_required', field: 'latitude', required: true, type: 'number', min: -90, max: 90 },
      { name: 'longitude_required', field: 'longitude', required: true, type: 'number', min: -180, max: 180 },
      { name: 'description_required', field: 'descriptionAr', required: true, type: 'string', minLength: 10 }
    ]);
  }

  async validateRecord(entityType: string, record: Record<string, unknown>, recordId: string): Promise<ValidationResult> {
    const rules = this.validationRules.get(entityType);
    if (!rules) {
      return {
        valid: false,
        errors: [`No validation rules found for entity type: ${entityType}`],
        warnings: [],
        metadata: {
          recordId,
          entityType,
          validatedAt: new Date(),
          rules: []
        }
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const appliedRules: string[] = [];

    for (const rule of rules) {
      appliedRules.push(rule.name);
      const value = record[rule.field];

      try {
        // Required field validation
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(`${rule.field} is required`);
          continue;
        }

        // Skip further validation if field is optional and empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
          continue;
        }

        // Type validation
        if (rule.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (actualType !== rule.type) {
            errors.push(`${rule.field} must be of type ${rule.type}, got ${actualType}`);
            continue;
          }
        }

        // String validations
        if (rule.type === 'string' && typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} format is invalid`);
          }
        }

        // Number validations
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.field} must be at most ${rule.max}`);
          }
        }

        // Enum validation
        if (rule.enum && typeof value === 'string' && !rule.enum.includes(value)) {
          errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
        }

        // Custom validation
        if (rule.custom && !rule.custom(value)) {
          errors.push(`${rule.field} failed custom validation: ${rule.name}`);
        }

      } catch (error) {
        errors.push(`Validation error for ${rule.field}: ${error}`);
      }
    }

    // Additional business logic validations
    await this.performBusinessValidations(entityType, record, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        recordId,
        entityType,
        validatedAt: new Date(),
        rules: appliedRules
      }
    };
  }

  private async performBusinessValidations(entityType: string, record: Record<string, unknown>, errors: string[], warnings: string[]) {
    switch (entityType) {
      case 'shelter':
        // Check for duplicate shelters within 100 meters
        const recordId = record.id as string;
        const latitude = record.latitude as number;
        const longitude = record.longitude as number;
        
        const nearbyShelters = await prisma.shelter.findMany({
          where: {
            id: { not: recordId },
            latitude: { gte: latitude - 0.001, lte: latitude + 0.001 },
            longitude: { gte: longitude - 0.001, lte: longitude + 0.001 }
          }
        });

        if (nearbyShelters.length > 0) {
          warnings.push(`Found ${nearbyShelters.length} shelters within 100 meters`);
        }
        break;

      case 'hotline':
        // Check for duplicate phone numbers
        const phone = record.phone as string;
        const hotlineId = record.id as string;
        
        const existingPhone = await prisma.hotline.findFirst({
          where: { phone: phone, id: { not: hotlineId } }
        });

        if (existingPhone) {
          errors.push(`Phone number ${phone} already exists`);
        }
        break;

      case 'newsArticle':
        // Check for duplicate articles
        const originalUrl = record.originalUrl as string;
        const articleId = record.id as string;
        
        const existingArticle = await prisma.newsArticle.findFirst({
          where: { originalUrl: originalUrl, id: { not: articleId } }
        });

        if (existingArticle) {
          warnings.push(`Article with same URL already exists`);
        }
        break;
    }
  }

  async validateAllRecords(entityType: string): Promise<ValidationResult[]> {
    const records = await (prisma as any)[entityType].findMany() as Record<string, unknown>[];
    const results: ValidationResult[] = [];

    for (const record of records) {
      const result = await this.validateRecord(entityType, record, record.id as string);
      results.push(result);
    }

    return results;
  }

  async generateDataQualityReport(): Promise<{
    timestamp: string;
    summary: {
      totalEntities: number;
      validRecords: number;
      invalidRecords: number;
      warnings: number;
    };
    details: Record<string, unknown>;
  }> {
    const entityTypes = ['shelter', 'hotline', 'newsArticle', 'financialRate', 'threat'];
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEntities: 0,
        validRecords: 0,
        invalidRecords: 0,
        warnings: 0
      },
      details: {} as any
    };

    for (const entityType of entityTypes) {
      try {
        const results = await this.validateAllRecords(entityType);
        const validCount = results.filter(r => r.valid).length;
        const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

        report.details[entityType] = {
          total: results.length,
          valid: validCount,
          invalid: results.length - validCount,
          warnings: warningCount,
          validationErrors: results.filter(r => !r.valid).flatMap(r => r.errors)
        };

        report.summary.totalEntities += results.length;
        report.summary.validRecords += validCount;
        report.summary.invalidRecords += results.length - validCount;
        report.summary.warnings += warningCount;

      } catch (error) {
        console.warn(`Could not validate ${entityType}:`, error);
        report.details[entityType] = {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return report;
  }

  async saveValidationReport(report: {
    timestamp: string;
    summary: Record<string, unknown>;
    details: Record<string, unknown>;
  }): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `validation-report-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'data', 'logs', filename);

    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));

    return filepath;
  }
}

export const dataValidation = new DataValidationService();
