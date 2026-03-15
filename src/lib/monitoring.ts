import { dataPipeline } from './data-pipeline';
import { dataValidation } from './data-validation';
import { dataSync } from './data-sync';
import fs from 'fs/promises';
import path from 'path';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: string;
  threshold?: number;
  enabled: boolean;
  cooldownMinutes: number;
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, unknown>;
  resolved: boolean;
  resolvedAt?: Date;
}

export class MonitoringService {
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private lastAlertTimes: Map<string, Date> = new Map();
  private logsDir = path.join(process.cwd(), 'data', 'logs');

  constructor() {
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  private initializeDefaultRules() {
    this.alertRules = [
      {
        id: 'pipeline-failure',
        name: 'Data Pipeline Failure',
        description: 'Alert when a data pipeline fails multiple times',
        severity: 'high',
        condition: 'pipeline_failure_count',
        threshold: 3,
        enabled: true,
        cooldownMinutes: 30
      },
      {
        id: 'data-quality-degradation',
        name: 'Data Quality Degradation',
        description: 'Alert when data validation error rate exceeds threshold',
        severity: 'medium',
        condition: 'validation_error_rate',
        threshold: 0.1, // 10%
        enabled: true,
        cooldownMinutes: 60
      },
      {
        id: 'stale-data',
        name: 'Stale Data Alert',
        description: 'Alert when data hasn been updated recently',
        severity: 'low',
        condition: 'data_age_hours',
        threshold: 24, // 24 hours
        enabled: true,
        cooldownMinutes: 180
      },
      {
        id: 'cache-hit-rate-low',
        name: 'Low Cache Hit Rate',
        description: 'Alert when cache hit rate is below threshold',
        severity: 'low',
        condition: 'cache_hit_rate',
        threshold: 0.5, // 50%
        enabled: true,
        cooldownMinutes: 120
      },
      {
        id: 'database-connection-failure',
        name: 'Database Connection Failure',
        description: 'Alert when database connections fail',
        severity: 'critical',
        condition: 'db_connection_failure',
        enabled: true,
        cooldownMinutes: 15
      }
    ];
  }

  private startMonitoring() {
    // Run monitoring checks every 5 minutes
    setInterval(async () => {
      await this.runMonitoringChecks();
    }, 5 * 60 * 1000);

    // Cleanup old alerts every hour
    setInterval(async () => {
      await this.cleanupOldAlerts();
    }, 60 * 60 * 1000);

    console.log('🔍 Monitoring service started');
  }

  private async runMonitoringChecks() {
    try {
      await this.checkPipelineHealth();
      await this.checkDataQuality();
      await this.checkDataFreshness();
      await this.checkCachePerformance();
      await this.checkDatabaseHealth();
    } catch (error) {
      console.error('Monitoring check failed:', error);
      await this.createAlert('database-connection-failure', {
        message: 'Monitoring system failed to run checks',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async checkPipelineHealth() {
    const pipelineStatus = dataPipeline.getPipelineStatus();
    const failedPipelines = pipelineStatus.pipelines.filter(p => !p.running && p.enabled);

    if (failedPipelines.length > 0) {
      await this.createAlert('pipeline-failure', {
        message: `${failedPipelines.length} data pipelines are not running`,
        failedPipelines: failedPipelines.map(p => p.name),
        totalPipelines: pipelineStatus.total,
        runningPipelines: pipelineStatus.running
      });
    }
  }

  private async checkDataQuality() {
    try {
      const report = await dataValidation.generateDataQualityReport();
      const totalRecords = report.summary.totalEntities;
      const invalidRecords = report.summary.invalidRecords;
      
      if (totalRecords > 0) {
        const errorRate = invalidRecords / totalRecords;
        const threshold = this.alertRules.find(r => r.id === 'data-quality-degradation')?.threshold || 0.1;

        if (errorRate > threshold) {
          await this.createAlert('data-quality-degradation', {
            message: `Data quality degradation: ${(errorRate * 100).toFixed(1)}% error rate`,
            errorRate,
            totalRecords,
            invalidRecords,
            threshold
          });
        }
      }
    } catch (error) {
      console.warn('Data quality check failed:', error);
    }
  }

  private async checkDataFreshness() {
    try {
      const { prisma } = await import('./prisma');
      const now = new Date();
      const threshold = this.alertRules.find(r => r.id === 'stale-data')?.threshold || 24;
      const cutoffTime = new Date(now.getTime() - threshold * 60 * 60 * 1000);

      // Check various data types for freshness
      const checks = [
        { name: 'News', count: await prisma.newsArticle.count({ where: { createdAt: { gte: cutoffTime } } }) },
        { name: 'Threats', count: await prisma.threat.count({ where: { reportedAt: { gte: cutoffTime } } }) },
        { name: 'Financial Rates', count: await prisma.financialRate.count({ where: { createdAt: { gte: cutoffTime } } }) }
      ];

      const staleData = checks.filter(check => check.count === 0);
      
      if (staleData.length > 0) {
        await this.createAlert('stale-data', {
          message: `No updates for ${staleData.map(d => d.name).join(', ')} in ${threshold}+ hours`,
          staleData: staleData.map(d => d.name),
          thresholdHours: threshold
        });
      }
    } catch (error) {
      console.warn('Data freshness check failed:', error);
    }
  }

  private async checkCachePerformance() {
    try {
      const cacheStats = dataSync.getCacheStats();
      const threshold = this.alertRules.find(r => r.id === 'cache-hit-rate-low')?.threshold || 0.5;

      // Simple cache performance check (you'd want more sophisticated metrics)
      const activeEntries = cacheStats.activeEntries;
      const totalEntries = cacheStats.totalEntries;

      if (totalEntries > 0) {
        const hitRate = activeEntries / totalEntries;
        if (hitRate < threshold) {
          await this.createAlert('cache-hit-rate-low', {
            message: `Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`,
            hitRate,
            activeEntries,
            totalEntries,
            threshold
          });
        }
      }
    } catch (error) {
      console.warn('Cache performance check failed:', error);
    }
  }

  private async checkDatabaseHealth() {
    try {
      const { prisma } = await import('./prisma');
      
      // Simple database connectivity check
      await prisma.$queryRaw`SELECT 1`;
      
      // Check table counts
      const tableCounts = {
        shelters: await prisma.shelter.count(),
        hotlines: await prisma.hotline.count(),
        news: await prisma.newsArticle.count(),
        threats: await prisma.threat.count()
      };

      // Log for monitoring (could be sent to external monitoring service)
      console.log('Database health check passed:', tableCounts);
      
    } catch (error) {
      await this.createAlert('database-connection-failure', {
        message: 'Database connection or query failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async createAlert(ruleId: string, details: Record<string, unknown>): Promise<void> {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (!rule || !rule.enabled) return;

    // Check cooldown
    const lastAlert = this.lastAlertTimes.get(ruleId);
    if (lastAlert) {
      const timeSinceLastAlert = Date.now() - lastAlert.getTime();
      const cooldownMs = rule.cooldownMinutes * 60 * 1000;
      
      if (timeSinceLastAlert < cooldownMs) {
        return; // Still in cooldown period
      }
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId,
      timestamp: new Date(),
      severity: rule.severity,
      message: (details.message as string) || rule.description,
      details,
      resolved: false
    };

    this.alerts.push(alert);
    this.lastAlertTimes.set(ruleId, new Date());

    // Log the alert
    console.warn(`🚨 ALERT [${rule.severity.toUpperCase()}]: ${alert.message}`, details);

    // Save to file
    await this.saveAlertToFile(alert);

    // Send notifications (implement based on your notification system)
    await this.sendNotification(alert);
  }

  private async saveAlertToFile(alert: Alert) {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
      const filename = `alerts-${new Date().toISOString().split('T')[0]}.jsonl`;
      const filepath = path.join(this.logsDir, filename);
      
      await fs.appendFile(filepath, JSON.stringify(alert) + '\n');
    } catch (error) {
      console.error('Failed to save alert to file:', error);
    }
  }

  private async sendNotification(alert: Alert) {
    // Implement your notification logic here
    // Examples: email, Slack, webhook, SMS, etc.
    
    if (alert.severity === 'critical') {
      // Immediate notification for critical alerts
      console.log('🚨 CRITICAL ALERT NOTIFICATION SENT:', alert.message);
      // You could integrate with email services, Slack webhooks, etc.
    }
  }

  private async cleanupOldAlerts() {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp > cutoffDate || !alert.resolved
    );
  }

  // Public API methods
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAllAlerts(): Alert[] {
    return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<boolean> {
    const ruleIndex = this.alertRules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return false;

    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    return true;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date();
    return true;
  }

  getMonitoringSummary() {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');

    return {
      totalAlerts: this.alerts.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      highAlerts: highAlerts.length,
      lastCheck: new Date(),
      rules: this.alertRules.length,
      enabledRules: this.alertRules.filter(r => r.enabled).length
    };
  }
}

export const monitoring = new MonitoringService();
