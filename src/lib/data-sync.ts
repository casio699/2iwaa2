/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
  etag?: string;
  sourceHash?: string;
}

export interface SyncConfig {
  entityType: string;
  cacheDuration: number; // in seconds
  enableRealTime: boolean;
  dependencies: string[]; // other entity types that affect this cache
}

export class DataSyncService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private syncConfigs: Map<string, SyncConfig> = new Map();
  private subscribers: Map<string, Set<(data: unknown) => void>> = new Map();
  private cacheDir = path.join(process.cwd(), 'data', 'cache');

  constructor() {
    this.initializeSyncConfigs();
    this.startCacheCleanup();
  }

  private initializeSyncConfigs() {
    this.syncConfigs.set('shelters', {
      entityType: 'shelter',
      cacheDuration: 300, // 5 minutes
      enableRealTime: true,
      dependencies: ['threat']
    });

    this.syncConfigs.set('hotlines', {
      entityType: 'hotline',
      cacheDuration: 3600, // 1 hour
      enableRealTime: false,
      dependencies: []
    });

    this.syncConfigs.set('news', {
      entityType: 'newsArticle',
      cacheDuration: 180, // 3 minutes
      enableRealTime: true,
      dependencies: []
    });

    this.syncConfigs.set('threats', {
      entityType: 'threat',
      cacheDuration: 60, // 1 minute
      enableRealTime: true,
      dependencies: []
    });

    this.syncConfigs.set('financial', {
      entityType: 'financialRate',
      cacheDuration: 300, // 5 minutes
      enableRealTime: false,
      dependencies: []
    });

    this.syncConfigs.set('housing', {
      entityType: 'housing',
      cacheDuration: 600, // 10 minutes
      enableRealTime: true,
      dependencies: []
    });
  }

  private startCacheCleanup() {
    // Clean expired cache entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredCache() {
    const now = new Date();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }

  private generateCacheKey(entityType: string, params: Record<string, unknown>): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    const hash = createHash('md5').update(`${entityType}:${paramString}`).digest('hex');
    return `${entityType}:${hash}`;
  }

  async getCachedData<T = unknown>(entityType: string, params: Record<string, unknown> = {}): Promise<T | null> {
    const key = this.generateCacheKey(entityType, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async setCachedData<T = unknown>(entityType: string, data: T, params: Record<string, unknown> = {}): Promise<void> {
    const config = this.syncConfigs.get(entityType);
    if (!config) {
      console.warn(`No sync config found for entity type: ${entityType}`);
      return;
    }

    const key = this.generateCacheKey(entityType, params);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.cacheDuration * 1000);

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      sourceHash: this.generateDataHash(data)
    };

    this.cache.set(key, entry);

    // Persist to disk for recovery
    await this.persistCacheEntry(key, entry);

    // Notify subscribers if real-time is enabled
    if (config.enableRealTime) {
      this.notifySubscribers(entityType, data);
    }
  }

  private generateDataHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private async persistCacheEntry(key: string, entry: CacheEntry<unknown>): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      const filename = `${key.replace(/:/g, '_')}.json`;
      const filepath = path.join(this.cacheDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to persist cache entry:', error);
    }
  }

  async loadPersistedCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      let loaded = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.cacheDir, file);
          const content = await fs.readFile(filepath, 'utf8');
          const entry: CacheEntry<any> = JSON.parse(content);

          // Convert timestamp strings back to Date objects
          entry.timestamp = new Date(entry.timestamp);
          entry.expiresAt = new Date(entry.expiresAt);

          // Only load if not expired
          if (entry.expiresAt > new Date()) {
            const key = file.replace('.json', '').replace(/_/g, ':');
            this.cache.set(key, entry);
            loaded++;
          }
        } catch (error) {
          console.warn(`Failed to load cache file ${file}:`, error);
        }
      }

      console.log(`📦 Loaded ${loaded} cache entries from disk`);
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }

  subscribe(entityType: string, callback: (data: unknown) => void): () => void {
    if (!this.subscribers.has(entityType)) {
      this.subscribers.set(entityType, new Set());
    }

    const subscribers = this.subscribers.get(entityType)!;
    subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(entityType);
      }
    };
  }

  private notifySubscribers(entityType: string, data: unknown): void {
    const subscribers = this.subscribers.get(entityType);
    if (subscribers) {
      for (const callback of subscribers) {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      }
    }
  }

  async invalidateCache(entityType: string, params: Record<string, unknown> = {}): Promise<void> {
    const key = this.generateCacheKey(entityType, params);
    this.cache.delete(key);

    // Also invalidate dependent caches
    const config = this.syncConfigs.get(entityType);
    if (config) {
      for (const dependency of config.dependencies) {
        await this.invalidateCache(dependency);
      }
    }
  }

  async invalidateAllCache(): Promise<void> {
    this.cache.clear();
    
    // Clear persisted cache
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.warn('Failed to clear persisted cache:', error);
    }
  }

  async getFreshData<T = unknown>(entityType: string, params: Record<string, unknown> = {}): Promise<T> {
    // First try to get cached data
    const cached = await this.getCachedData<T>(entityType, params);
    if (cached) {
      return cached;
    }

    // If no cache, fetch from database
    const freshData = await this.fetchFromDatabase<T>(entityType, params);
    
    // Cache the fresh data
    await this.setCachedData(entityType, freshData, params);

    return freshData;
  }

  private async fetchFromDatabase<T = unknown>(entityType: string, params: Record<string, unknown> = {}): Promise<T> {
    const limit = (params.limit as number) || 50;
    const offset = (params.offset as number) || 0;

    switch (entityType) {
      case 'shelters':
        return await prisma.shelter.findMany({
          where: { reviewStatus: 'verified' },
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' }
        }) as T;

      case 'hotlines':
        return await prisma.hotline.findMany({
          where: { isActive: true },
          take: limit,
          skip: offset,
          orderBy: { displayOrder: 'asc' }
        }) as T;

      case 'news':
        return await prisma.newsArticle.findMany({
          take: limit,
          skip: offset,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            summaryAr: true,
            sourceName: true,
            sourceUrl: true,
            originalUrl: true,
            sourceType: true,
            category: true,
            tags: true,
            imageUrl: true,
            coverage: true,
            publishedAt: true,
            isBreaking: true,
            isVerified: true,
            viewCount: true
          }
        }) as T;

      case 'threats':
        return await prisma.threat.findMany({
          take: limit,
          skip: offset,
          orderBy: { reportedAt: 'desc' },
          where: { status: { not: 'false_alarm' } }
        }) as T;

      case 'financial':
        return await prisma.financialRate.findMany({
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          distinct: ['type']
        }) as T;

      case 'housing':
        return await prisma.housing.findMany({
          where: { isAvailable: true, verified: true },
          take: limit,
          skip: offset,
          orderBy: { featured: 'desc', createdAt: 'desc' }
        }) as T;

      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  getCacheStats() {
    const now = new Date();
    let totalEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalEntries++;
      if (entry.expiresAt < now) {
        expiredEntries++;
      }
    }

    const subscriberCounts: Record<string, number> = {};
    for (const [entityType, subscribers] of this.subscribers.entries()) {
      subscriberCounts[entityType] = subscribers.size;
    }

    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      subscriberCounts,
      syncConfigs: Array.from(this.syncConfigs.entries()).map(([key, config]) => ({
        entityType: key,
        cacheDuration: config.cacheDuration,
        enableRealTime: config.enableRealTime,
        dependencies: config.dependencies
      }))
    };
  }
}

export const dataSync = new DataSyncService();
