/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { dataSync } from './data-sync';
import { prisma } from './prisma';

export class RealtimeService {
  private io: SocketIOServer;
  private connectedClients: Map<string, any> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
    this.setupDatabaseListeners();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, {
        socket,
        connectedAt: new Date(),
        subscriptions: new Set()
      });

      // Handle subscription requests
      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data);
      });

      // Handle unsubscription requests
      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data);
      });

      // Handle location-based subscriptions
      socket.on('subscribe_location', (data) => {
        this.handleLocationSubscription(socket, data);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      // Send initial data
      this.sendInitialData(socket);
    });
  }

  private async sendInitialData(socket: any) {
    try {
      // Send critical data immediately
      const [urgentAlerts, recentThreats, breakingNews] = await Promise.all([
        prisma.alert.findMany({
          where: { 
            severity: 'urgent',
            publishedAt: { not: null },
            endsAt: { gte: new Date() }
          },
          take: 5,
          orderBy: { publishedAt: 'desc' }
        }),
        prisma.threat.findMany({
          where: { status: { not: 'false_alarm' } },
          take: 10,
          orderBy: { reportedAt: 'desc' }
        }),
        prisma.newsArticle.findMany({
          where: { isBreaking: true },
          take: 10,
          orderBy: { publishedAt: 'desc' }
        })
      ]);

      socket.emit('initial_data', {
        urgentAlerts,
        recentThreats,
        breakingNews,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send initial data:', error);
    }
  }

  private handleSubscription(socket: any, data: { entityType: string, filters?: any }) {
    const { entityType, filters } = data;
    const client = this.connectedClients.get(socket.id);

    if (!client) return;

    // Add to client's subscriptions
    client.subscriptions.add(entityType);

    // Subscribe to data sync updates
    const unsubscribe = dataSync.subscribe(entityType, (updateData) => {
      socket.emit('data_update', {
        entityType,
        data: updateData,
        timestamp: new Date().toISOString()
      });
    });

    // Store unsubscribe function for cleanup
    socket.on(`unsubscribe_${entityType}`, unsubscribe);

    // Send current data
    this.getCurrentData(entityType, filters).then(currentData => {
      socket.emit('current_data', {
        entityType,
        data: currentData,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`📡 Client ${socket.id} subscribed to ${entityType}`);
  }

  private handleUnsubscription(socket: any, data: { entityType: string }) {
    const { entityType } = data;
    const client = this.connectedClients.get(socket.id);

    if (!client) return;

    client.subscriptions.delete(entityType);
    socket.emit(`unsubscribe_${entityType}`);

    console.log(`📡 Client ${socket.id} unsubscribed from ${entityType}`);
  }

  private handleLocationSubscription(socket: any, data: { 
    latitude: number, 
    longitude: number, 
    radiusKm: number 
  }) {
    const { latitude, longitude, radiusKm } = data;
    const client = this.connectedClients.get(socket.id);

    if (!client) return;

    // Store location subscription
    client.locationSubscription = { latitude, longitude, radiusKm };

    // Send nearby threats and alerts
    this.getNearbyData(latitude, longitude, radiusKm).then(nearbyData => {
      socket.emit('nearby_data', {
        center: { latitude, longitude },
        radiusKm,
        data: nearbyData,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`📍 Client ${socket.id} subscribed to location updates`);
  }

  private async getCurrentData(entityType: string, filters: any = {}) {
    try {
      return await dataSync.getFreshData(entityType, filters);
    } catch (error) {
      console.error(`Failed to get current data for ${entityType}:`, error);
      return null;
    }
  }

  private async getNearbyData(latitude: number, longitude: number, radiusKm: number) {
    try {
      // Find nearby threats (within radius)
      const nearbyThreats = await prisma.$queryRaw`
        SELECT *, 
          ST_Distance(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography
          ) as distance_meters
        FROM "Threat" 
        WHERE status != 'false_alarm'
          AND ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radiusKm * 1000}
          )
        ORDER BY distance_meters
        LIMIT 20
      `;

      // Find nearby shelters
      const nearbyShelters = await prisma.$queryRaw`
        SELECT *, 
          ST_Distance(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography
          ) as distance_meters
        FROM "Shelter" 
        WHERE "reviewStatus" = 'verified'
          AND ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radiusKm * 1000}
          )
        ORDER BY distance_meters
        LIMIT 20
      `;

      // Find active alerts in the area
      const nearbyAlerts = await prisma.$queryRaw`
        SELECT *, 
          ST_Distance(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography
          ) as distance_meters
        FROM "Alert" 
        WHERE "publishedAt" IS NOT NULL
          AND ("endsAt" IS NULL OR "endsAt" > NOW())
          AND ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radiusKm * 1000}
          )
        ORDER BY "publishedAt" DESC
        LIMIT 10
      `;

      return {
        threats: nearbyThreats,
        shelters: nearbyShelters,
        alerts: nearbyAlerts
      };
    } catch (error) {
      console.error('Failed to get nearby data:', error);
      return { threats: [], shelters: [], alerts: [] };
    }
  }

  private setupDatabaseListeners() {
    // Listen for database changes through Prisma middleware
    // This requires setting up Prisma middleware or using database triggers
    
    // For now, we'll manually trigger updates when data changes
    // In production, you'd use database triggers or change data capture
  }

  // Public methods to broadcast updates
  broadcastThreatUpdate(threat: any) {
    this.io.emit('threat_update', {
      threat,
      timestamp: new Date().toISOString()
    });

    // Also update location-based subscribers
    this.broadcastToLocationSubscribers('threat', threat);
  }

  broadcastAlertUpdate(alert: any) {
    this.io.emit('alert_update', {
      alert,
      timestamp: new Date().toISOString()
    });

    this.broadcastToLocationSubscribers('alert', alert);
  }

  broadcastNewsUpdate(news: any) {
    this.io.emit('news_update', {
      news,
      timestamp: new Date().toISOString()
    });
  }

  private broadcastToLocationSubscribers(type: string, data: any) {
    if (!data.latitude || !data.longitude) return;

    for (const [socketId, client] of this.connectedClients.entries()) {
      if (!client.locationSubscription) continue;

      const { latitude, longitude, radiusKm } = client.locationSubscription;
      const distance = this.calculateDistance(
        latitude, longitude,
        data.latitude, data.longitude
      );

      if (distance <= radiusKm) {
        client.socket.emit('nearby_update', {
          type,
          data,
          distance,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      subscriptions: Array.from(this.connectedClients.values()).reduce(
        (total, client) => total + client.subscriptions.size, 0
      ),
      locationSubscriptions: Array.from(this.connectedClients.values()).filter(
        client => client.locationSubscription
      ).length
    };
  }
}

// Global instance
let realtimeService: RealtimeService;

export function initializeRealtime(httpServer: HTTPServer) {
  if (!realtimeService) {
    realtimeService = new RealtimeService(httpServer);
  }
  return realtimeService;
}

export function getRealtimeService(): RealtimeService {
  if (!realtimeService) {
    throw new Error('Realtime service not initialized. Call initializeRealtime first.');
  }
  return realtimeService;
}
