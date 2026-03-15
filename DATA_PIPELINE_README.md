# Al-Menassa Data Pipeline System

A comprehensive, automated data acquisition and management system for humanitarian crisis response in Lebanon. This system continuously scours the internet for relevant datasets, automatically updates them, and provides real-time access through a robust API infrastructure.

## 🚀 Features

### Data Sources & Acquisition
- **RSS News Aggregation**: Automatically imports from 10+ Lebanese news sources (Naharnet, LBCI, MTV, etc.)
- **Financial Data**: Real-time exchange rates from BDL, LiraRate, and Sayrafa platforms
- **OpenStreetMap**: Weekly imports of shelters, hospitals, and POIs for Lebanon
- **ReliefWeb API**: Humanitarian reports and situation updates
- **Curated Hotlines**: Emergency contact database with automatic deduplication

### Data Processing & Quality
- **Data Validation**: Comprehensive validation rules for all data types
- **Data Provenance**: Complete source tracking with timestamps and hashes
- **Automated Cleaning**: Duplicate detection, normalization, and quality checks
- **Business Logic Validation**: Geographic proximity checks, format validation

### Real-time Infrastructure
- **Smart Caching**: Multi-layer caching with configurable TTL per data type
- **WebSocket Updates**: Real-time push notifications for critical updates
- **Location-based Subscriptions**: Geofenced alerts for nearby threats and shelters
- **Offline Support**: Persistent cache with automatic synchronization

### Monitoring & Reliability
- **Health Monitoring**: Automated checks for pipeline failures, data quality, and system health
- **Alert System**: Configurable alerts with severity levels and cooldown periods
- **Performance Metrics**: Cache hit rates, data freshness, and pipeline statistics
- **Error Tracking**: Comprehensive logging with structured error reports

### CI/CD Integration
- **GitHub Actions**: Automated pipeline execution every 2 hours
- **Data Reports**: Automated quality and completeness reports
- **Rollback Support**: Version-controlled data imports with rollback capability
- **Environment Isolation**: Separate staging and production data pipelines

## 📊 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│  Data Pipeline   │───▶│   PostgreSQL    │
│                 │    │                  │    │   Database      │
│ • RSS Feeds     │    │ • Scraping       │    │                 │
│ • APIs          │    │ • Validation     │    │ • Shelters      │
│ • OSM Data      │    │ • Transformation │    │ • News          │
│ • Financial     │    │ • Provenance     │    │ • Threats       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Cache Layer     │
                       │                  │
                       │ • Redis-style    │
                       │ • Persistence    │
                       │ • Real-time      │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   API Layer     │
                       │                  │
                       │ • REST Endpoints │
                       │ • WebSocket      │
                       │ • Validation     │
                       └──────────────────┘
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with PostGIS extension
- Redis (optional, for enhanced caching)
- osm2pgsql (for OSM data imports)

### Database Setup
```bash
# Install PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;

# Run database migrations
npm run db:setup
```

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/al-menassa"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
REDIS_URL="redis://localhost:6379" (optional)
```

### Install Dependencies
```bash
npm install
npm run db:generate
npm run db:setup
```

## 🚀 Quick Start

### 1. Seed Initial Data
```bash
npm run data:seed
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Data Pipelines
```bash
# Run all pipelines
npm run pipeline:all

# Run specific pipeline
npm run pipeline:single rss-news
```

### 4. Generate Data Report
```bash
npm run data:report
```

## 📡 API Endpoints

### Data Access
- `GET /api/data?type=shelters` - Get shelters with pagination
- `GET /api/data?type=news` - Get news articles
- `GET /api/data?type=threats` - Get threat data
- `GET /api/data?type=financial` - Get financial rates
- `GET /api/data?type=hotlines` - Get emergency hotlines

### Pipeline Management
- `GET /api/data/pipeline` - Get pipeline status
- `POST /api/data/pipeline` - Control pipelines (start/stop/run)
- `POST /api/data/import` - Manual data import

### Data Quality
- `GET /api/data/validation` - Get validation report
- `GET /api/data/validation?type=shelters` - Validate specific entity type

### Monitoring
- `GET /api/monitoring` - Get monitoring summary
- `GET /api/monitoring?type=alerts` - Get active alerts
- `POST /api/monitoring` - Manage alerts and rules

### System Health
- `GET /api/health` - System health check

## ⚙️ Configuration

### Pipeline Schedules
Pipelines run automatically based on configured schedules:

- **RSS News**: Every 30 minutes
- **Financial Rates**: Every 2 hours
- **ReliefWeb**: Every 6 hours
- **OSM Data**: Daily at 2 AM
- **Hotlines**: Daily at midnight

### Cache Configuration
Cache TTL settings per data type:

- **Threats**: 1 minute (high priority)
- **News**: 3 minutes
- **Shelters**: 5 minutes
- **Financial**: 5 minutes
- **Housing**: 10 minutes
- **Hotlines**: 1 hour

### Alert Rules
Default monitoring rules:

- **Pipeline Failures**: Alert after 3 failures
- **Data Quality**: Alert at 10% error rate
- **Stale Data**: Alert after 24 hours without updates
- **Cache Performance**: Alert below 50% hit rate
- **Database**: Immediate alert on connection failures

## 🔧 Advanced Usage

### Custom Data Sources
Add new data sources by extending the `DataAcquisitionService`:

```typescript
// src/lib/data-acquisition.ts
async importCustomData(): Promise<ImportResult> {
  // Your custom import logic
}
```

### Validation Rules
Add custom validation rules:

```typescript
// src/lib/data-validation.ts
this.validationRules.set('customEntity', [
  { name: 'field_required', field: 'name', required: true },
  // Add more rules
]);
```

### Real-time Subscriptions
Subscribe to real-time updates:

```typescript
import { dataSync } from '@/lib/data-sync';

const unsubscribe = dataSync.subscribe('threats', (data) => {
  console.log('New threat data:', data);
});
```

## 📈 Monitoring & Analytics

### Data Quality Metrics
- Validation error rates by entity type
- Data freshness indicators
- Source reliability scores
- Duplicate detection rates

### Performance Metrics
- Cache hit/miss ratios
- API response times
- Database query performance
- Pipeline execution times

### System Health
- Database connectivity
- External API availability
- Disk space usage
- Memory consumption

## 🚨 CI/CD Pipeline

### GitHub Actions Workflow
- **Triggers**: Push to main/develop, schedule (every 2 hours), manual
- **Steps**: Setup → Database → Pipeline → Report → Deploy
- **Artifacts**: Pipeline logs, data reports, validation results

### Environment Management
- **Development**: Local development with sample data
- **Staging**: Full pipeline with test data
- **Production**: Live data with monitoring

## 🛡️ Security & Compliance

### Data Privacy
- No personal data stored without consent
- GDPR-compliant data handling
- Secure API authentication
- Rate limiting and abuse prevention

### Data Provenance
- Complete source tracking for all records
- Immutable audit logs
- Version-controlled data imports
- Chain of custody documentation

## 🤝 Contributing

### Adding New Data Sources
1. Update `data/sources.md` with source details
2. Add import logic to `DataAcquisitionService`
3. Create validation rules in `DataValidationService`
4. Add pipeline configuration to `DataPipelineScheduler`
5. Update API endpoints if needed

### Testing
```bash
# Run all tests
npm test

# Run pipeline tests
npm run test:pipelines

# Run validation tests
npm run test:validation
```

## 📞 Support

### Troubleshooting
- Check `/api/health` for system status
- Review `/api/monitoring` for active alerts
- Examine pipeline logs in `data/logs/`
- Validate data quality with `/api/data/validation`

### Common Issues
- **OSM Import Fails**: Install osm2pgsql and PostGIS
- **RSS Feed Errors**: Check feed URLs and rate limits
- **Database Connection**: Verify DATABASE_URL and permissions
- **Cache Issues**: Clear cache with `DELETE /api/cache`

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** and Geofabrik for geographic data
- **ReliefWeb** for humanitarian information
- **Lebanese News Sources** for real-time information
- **Banque du Liban** for financial data
- **Humanitarian Data Exchange** for shelter data

---

Built with ❤️ for the people of Lebanon during times of crisis.
