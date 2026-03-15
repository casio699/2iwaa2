# Al-Menassa Data Sources Catalog (Lebanon)

This document catalogs external datasets and feeds that can be imported to support current and future features.

**Policy chosen**: scraping allowed, but **raw datasets must NOT be committed** to git.

## Conventions

- Store downloads in `data/raw/` (gitignored)
- Store normalized outputs in `data/normalized/` (gitignored by default)
- Store curated, versioned seed lists in `data/seed/` (committed)
- Keep a machine-readable manifest: `data/sources.json` (to be added)

---

## 1) Shelters / Housing / Accommodation

### 1.1 OpenStreetMap (OSM) — Lebanon extract (Geofabrik)
- **Use**: baseline for shelters, amenities, buildings, POIs; emergency/shelter tags vary but useful.
- **Type**: PBF extract
- **URL**: https://download.geofabrik.de/asia/lebanon.html
- **License**: ODbL 1.0
- **Refresh**: daily/weekly (per Geofabrik)
- **Import approach (current)**:
  - Load with `osm2pgsql` into PostGIS and query tables/views.
  - Local file (gitignored): `data/raw/osm/lebanon-latest.osm.pbf`
  - DB tables created by import:
    - `planet_osm_point`, `planet_osm_line`, `planet_osm_polygon`, `planet_osm_roads`
  - DB extension required: `hstore`
  - Views created for app-friendly consumption (WGS84 / EPSG:4326):
    - `osm_healthcare_points`
    - `osm_healthcare_polygons`

### 1.2 Official shelter lists and interactive maps
- **Use**: authoritative designated shelters (schools/technical institutes used as shelters)
- **Sources**:
  - **Beirut Urban Lab shelter web-map**: https://beiruturbanlab.com/en/Details/2005
  - **Lebanon Crisis Map (ArcGIS)**: https://experience.arcgis.com/experience/...
  - **UNHCR operational data portal**: https://data.unhcr.org/en/situations/leb-shelters
- **License**: varies (check per source)
- **Refresh**: weekly/monthly
- **Import approach**:
  - Locate underlying GeoJSON/tiles endpoint via browser dev tools
  - Respect robots/ToS and caching guidelines
  - Store provenance fields (`sourceUrl`, `sourceRetrievedAt`)

### 1.3 Municipal-level shelter data (crowdsourced/official)
- **Use**: neighborhood-level shelter availability
- **Sources**:
  - **Lebanon Shelter Cluster (Humanitarian Data Exchange)**: https://data.humdata.org/dataset/lebanon-shelters
  - **OpenStreetMap + manual curation**: https://www.openstreetmap.org/#map=13/33.8938/35.5018
- **License**: CC BY or ODbL depending on source
- **Refresh**: as updates are published
- **Import approach**:
  - Manual curation + CSV export
  - Link OSM IDs to shelter records where available

### 1.4 UN ReliefWeb Lebanon response
- **URL**: https://reliefweb.int/disaster/dr-2024-000146-lbn
- **Use**: situation reports, funding appeals, operational updates
- **API**: ReliefWeb API v1 (JSON)
- **License**: CC BY
- **Refresh**: daily via API polling

---

## 2) Hotlines / Emergency numbers

### 2.1 Official emergency numbers (curated)
- **Use**: emergency hotlines, ambulance, civil defense, security forces
- **Sources**:
  - **Lebanese Civil Defense**: https://www.civildefense.gov.lb/ - Emergency: 125, Unified: 112
  - **Lebanese Red Cross**: https://www.redcross.org.lb/ - Ambulance: 140, Emergency: 112
  - **Ministry of Public Health**: https://www.moph.gov.lb/ - Hotline: 1214
  - **General Security**: https://www.general-security.gov.lb/ - 117
  - **Internal Security Forces**: https://www.isf.gov.lb/ - Emergency: 112, Operations: 01-429701
  - **Customs**: https://www.customs.gov.lb/ - 1735
- **License**: public information (government services)
- **Import approach**:
  - Curated seed list: `data/seed/hotlines.csv` (committed)
  - Import to database via API or seed script
  - Keep URL references for verification

### 2.2 NGO/Organization hotlines
- **Use**: humanitarian organizations, local NGOs
- **Sources**:
  - **UNHCR Lebanon**: https://www.unhcr.org/lb/ - Contact via website
  - **UNICEF Lebanon**: https://www.unicef.org/lebanon/ - Emergency contacts
  - **ICRC (Lebanon)**: https://www.icrc.org/en/where-we-work/middle-east/lebanon
  - **World Food Programme**: https://www.wfp.org/countries/lebanon
- **License**: public contact information
- **Import approach**:
  - Manual curation + verification
  - Store in same hotlines table with category tag

---

## 3) Hospitals / Clinics / Pharmacies

### 3.1 OSM POIs (PostGIS views)
- **Use**: hospitals, clinics, pharmacies
- **License**: ODbL 1.0
- **Refresh**: rerun OSM import occasionally
- **Import approach (current)**:
  - Use the PostGIS views:
    - `osm_healthcare_points`
    - `osm_healthcare_polygons`
  - App API endpoint available:
    - `GET /api/pois/healthcare?amenity=hospital|clinic|pharmacy&limit=...`

---

## 4) Threat / Incident data

### 4.1 News-based incident extraction (future)
- **Use**: incidents from verified sources
- **Approach**:
  - Start with manual/admin entry + moderation
  - Later integrate OSINT feeds if legally allowed and stable

---

## 5) News aggregation sources

### 5.1 Lebanese news sources (RSS)
- **Use**: news aggregation for threat/incident detection and user information
- **Sources with RSS**:
  - **Naharnet**: https://www.naharnet.com/rss (Arabic)
  - **Daily Star Lebanon**: https://www.dailystar.com.lb/RSS.ashx (English)
  - **Lebanon 24**: https://www.lebanon24.com/rss (Arabic)
  - **LBCI**: https://www.lbcgroup.tv/rss (Arabic)
  - **Al Jadeed**: https://www.aljadeed.tv/rss (Arabic)
  - **MTV Lebanon**: https://www.mtv.com.lb/rss (Arabic)
  - **National News Agency**: https://www.nna-leb.gov.lb/rss (Arabic, official)
  - **L'Orient Today**: https://www.lorienttoday.com/rss (English)
  - **Al-Akhbar**: https://al-akhbar.com/rss (Arabic)
- **License**: varies per publisher (fair use for headlines typically)
- **Import approach**:
  - Seed list: `data/seed/rss_sources.csv` (committed)
  - Fetch via RSS parsers (Node.js: `rss-parser`, Python: `feedparser`)
  - Store articles with source attribution and publish date
  - Deduplicate by URL or content hash

### 5.2 ReliefWeb API (Humanitarian news)
- **URL**: https://api.reliefweb.int/v1/reports?filter[country]=Lebanon
- **Use**: situation reports, humanitarian updates, appeals
- **API**: REST API with JSON
- **License**: CC BY (with attribution)
- **Refresh**: every 6 hours
- **Import approach**:
  - Direct API calls with pagination
  - Store reports with links to original documents

### 5.3 ACLED (Armed Conflict Location & Event Data)
- **URL**: https://acleddata.com/ (Lebanon data available)
- **Use**: conflict incidents, threat mapping
- **API**: Available with academic/NGO registration
- **License**: academic/non-commercial use
- **Note**: Requires registration for API access
- **Import approach**:
  - API polling after registration
  - Geocode incidents for threat database

---

## 6) Finance / FX rates

### 6.1 Lebanese Lira exchange rates
- **Use**: official and black market exchange rates (USD/LBP)
- **Sources**:
  - **Banque du Liban (Central Bank)**: https://www.bdl.gov.lb/ - Official rates
  - **Lira Rate (aggregator)**: https://lirarate.org/ - Black market rates
  - **SAYRAFA platform**: https://sayrafa.com/ - Market rates via app
  - **Adde Dollar**: https://addeddollar.com/ - Parallel market aggregator
- **License**: varies (public data for rates, proprietary for some aggregators)
- **Refresh**: hourly for parallel market, daily for official
- **Import approach**:
  - Scraping with caching (respect rate limits)
  - Store historical rates for trend analysis
  - Note: parallel market rates are unofficial estimates

### 6.2 Fuel prices (Lebanon)
- **Use**: gasoline/diesel prices (subsidized vs market)
- **Source**: Ministry of Energy and Water (https://www.energyandwater.gov.lb/) announcements
- **License**: public information
- **Refresh**: weekly or as announced
- **Import approach**:
  - Monitor official announcements
  - Track price history

### 6.3 Gold prices (International)
- **Use**: gold prices for investment and economic indicators
- **Source**: World Gold Council (https://www.gold.org/) - International gold prices
- **License**: public market data
- **Refresh**: hourly during market hours
- **Import approach**:
  - Scrape real-time gold prices
  - Convert to USD per gram for consistency
  - Store both 24k and 21k prices (calculated)

---

## 7) Flight Information

### 7.1 Beirut Rafic Hariri International Airport
- **Use**: real-time flight arrivals and departures
- **Source**: Beirut Airport official website (https://www.beirutairport.gov.lb/)
- **License**: public information
- **Refresh**: every 5 minutes for real-time updates
- **Import approach**:
  - Scrape flight information from airport website
  - Track arrivals, departures, delays, and gate information
  - Note: May require authentication or API integration in production
- **Alternative sources**:
  - FlightAware API
  - FlightRadar24 API
  - Amadeus API (commercial)

---

## Data provenance requirements (best practice)

Every imported record should store:
- `sourceName`
- `sourceUrl`
- `sourceRetrievedAt`
- `license`
- `rawHash` (sha256)
