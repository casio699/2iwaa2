-- Database schema for 2iwa2 - منصة إيواء

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shelters table (official & NGO)
CREATE TABLE shelters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    total_capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    status TEXT DEFAULT 'available', -- 'available', 'full', 'limited'
    managed_by TEXT, -- 'government', 'ngo', 'municipality'
    contact_info TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housing table (private offers)
CREATE TABLE housing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'apartment', 'room', 'shared'
    price_usd NUMERIC DEFAULT 0, -- 0 for free
    is_free BOOLEAN DEFAULT TRUE,
    amenities JSONB, -- {electricity: true, water: true, internet: true}
    location_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'rented', 'hidden'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table (threats & security)
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'threat', 'strike', 'evacuation'
    description TEXT,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    source TEXT, -- 'user', 'official', 'idf_scrape'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table (aggregated)
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    source_name TEXT,
    source_url TEXT,
    category TEXT, -- 'security', 'humanitarian', 'financial'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Data table
CREATE TABLE financial_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL, -- 'USD Exchange Rate', 'Fuel Price', etc.
    value NUMERIC NOT NULL,
    unit TEXT, -- 'LBP', 'USD', 'Gram'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read for shelters" ON shelters FOR SELECT USING (true);
CREATE POLICY "Public read for housing" ON housing FOR SELECT USING (true);
CREATE POLICY "Public read for alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public read for news" ON news FOR SELECT USING (true);
CREATE POLICY "Public read for financial_data" ON financial_data FOR SELECT USING (true);
