-- Create all new tables for 2iwa2 comprehensive platform

-- Housing table (Airbnb-style shelter exchange)
CREATE TABLE IF NOT EXISTS "Housing" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL, -- free | rent | hotel
    price FLOAT,
    currency TEXT, -- USD | LBP
    capacity INTEGER NOT NULL,
    amenities TEXT[], -- ["electricity", "water", "hot_water", "internet"]
    photos TEXT[],
    "hostName" TEXT NOT NULL,
    "hostPhone" TEXT NOT NULL,
    "hostWhatsApp" TEXT,
    "hostType" TEXT NOT NULL, -- civilian | ngo | municipality | hotel
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    "addressAr" TEXT,
    "governorateAr" TEXT,
    "districtAr" TEXT,
    "availableFrom" TIMESTAMP NOT NULL,
    "availableTo" TIMESTAMP,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    verified BOOLEAN NOT NULL DEFAULT false,
    featured BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_housing_type ON "Housing"(type);
CREATE INDEX IF NOT EXISTS idx_housing_available ON "Housing"("isAvailable");
CREATE INDEX IF NOT EXISTS idx_housing_verified ON "Housing"(verified);

-- Reviews table
CREATE TABLE IF NOT EXISTS "Review" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "housingId" TEXT NOT NULL REFERENCES "Housing"(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    "commentAr" TEXT,
    "guestName" TEXT,
    verified BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_review_housing ON "Review"("housingId");

-- News Articles table (Minassa News)
CREATE TABLE IF NOT EXISTS "NewsArticle" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT,
    "summaryAr" TEXT,
    content TEXT,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL, -- official | mainstream | social | international
    category TEXT NOT NULL, -- threat | shelter | humanitarian | general
    tags TEXT[],
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    coverage TEXT[], -- ["LBCI", "MTV", "Daily Star"]
    "coverageBias" JSONB,
    "publishedAt" TIMESTAMP NOT NULL,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "submittedBy" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_category ON "NewsArticle"(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON "NewsArticle"("publishedAt");
CREATE INDEX IF NOT EXISTS idx_news_breaking ON "NewsArticle"("isBreaking");
CREATE INDEX IF NOT EXISTS idx_news_source ON "NewsArticle"("sourceName");

-- Threats database
CREATE TABLE IF NOT EXISTS "Threat" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL, -- rocket | airstrike | shelling | border_clash | drone | naval | ground
    subtype TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    "areaNameAr" TEXT NOT NULL,
    "areaNameLb" TEXT,
    governorate TEXT,
    "reportedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    casualties INTEGER,
    "damageLevel" TEXT, -- minor | moderate | severe | unknown
    source TEXT NOT NULL, -- user | admin | idf_statement | news | intelligence
    "sourceUrl" TEXT,
    "evidenceUrls" TEXT[],
    status TEXT NOT NULL DEFAULT 'pending', -- pending | verified | false_alarm | investigating
    "verifiedAt" TIMESTAMP,
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "sheltersAffected" TEXT[],
    "hospitalsActivated" BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_threat_type ON "Threat"(type);
CREATE INDEX IF NOT EXISTS idx_threat_status ON "Threat"(status);
CREATE INDEX IF NOT EXISTS idx_threat_governorate ON "Threat"(governorate);
CREATE INDEX IF NOT EXISTS idx_threat_reported ON "Threat"("reportedAt");

-- Help Offers and Requests
CREATE TABLE IF NOT EXISTS "HelpPost" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL, -- offer | request
    category TEXT NOT NULL, -- shelter | money | food | clothing | medical | utilities | transport | volunteer | other
    "titleAr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT NOT NULL,
    "contactWhatsApp" TEXT,
    location TEXT,
    latitude FLOAT,
    longitude FLOAT,
    "housingId" TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active | fulfilled | closed | expired
    urgency TEXT NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
    "matchedWith" TEXT,
    "matchedAt" TIMESTAMP,
    verified BOOLEAN NOT NULL DEFAULT false,
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_help_type ON "HelpPost"(type);
CREATE INDEX IF NOT EXISTS idx_help_category ON "HelpPost"(category);
CREATE INDEX IF NOT EXISTS idx_help_status ON "HelpPost"(status);
CREATE INDEX IF NOT EXISTS idx_help_urgency ON "HelpPost"(urgency);

-- Financial Rates
CREATE TABLE IF NOT EXISTS "FinancialRate" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL, -- lira_official | lira_black | lira_sayrafa | fuel_95 | fuel_98 | fuel_diesel | gold_24k | gold_21k | usd | eur
    value FLOAT NOT NULL,
    currency TEXT NOT NULL, -- LBP | USD | EUR
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "previousValue" FLOAT,
    "changePercent" FLOAT,
    region TEXT NOT NULL DEFAULT 'Lebanon',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_financial_type ON "FinancialRate"(type);
CREATE INDEX IF NOT EXISTS idx_financial_created ON "FinancialRate"("createdAt");

-- User Alert Subscriptions (enhanced)
CREATE TABLE IF NOT EXISTS "UserAlertSubscription" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    fingerprint TEXT NOT NULL,
    areas TEXT[], -- ["Beirut", "Saida", "Tripoli"]
    "alertTypes" TEXT[] NOT NULL DEFAULT '{"urgent","warning"}',
    categories TEXT[] NOT NULL DEFAULT '{"all"}',
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushSubscription" JSONB,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    email TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedAt" TIMESTAMP,
    "notificationCount" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_subscription_fingerprint ON "UserAlertSubscription"(fingerprint);
CREATE INDEX IF NOT EXISTS idx_subscription_active ON "UserAlertSubscription"("isActive");

-- Notification Queue
CREATE TABLE IF NOT EXISTS "NotificationQueue" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL, -- sms | whatsapp | email
    recipient TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "messageEn" TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | sent | failed
    "sentAt" TIMESTAMP,
    error TEXT,
    "alertId" TEXT,
    "threatId" TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_status ON "NotificationQueue"(status);
CREATE INDEX IF NOT EXISTS idx_notification_created ON "NotificationQueue"("createdAt");

-- Offline Cache
CREATE TABLE IF NOT EXISTS "OfflineCache" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cacheKey" TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL,
    "dataType" TEXT NOT NULL, -- shelters | hotlines | threats | news
    "expiresAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_type ON "OfflineCache"("dataType");
CREATE INDEX IF NOT EXISTS idx_cache_expires ON "OfflineCache"("expiresAt");

-- Analytics Events
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    fingerprint TEXT,
    data JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON "AnalyticsEvent"("eventType");
CREATE INDEX IF NOT EXISTS idx_analytics_created ON "AnalyticsEvent"("createdAt");
