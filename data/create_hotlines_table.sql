CREATE TABLE IF NOT EXISTS "Hotline" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nameAr" TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'Lebanon',
    category TEXT NOT NULL,
    notes TEXT,
    "sourceUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hotlines_category ON "Hotline"(category);
CREATE INDEX IF NOT EXISTS idx_hotlines_active ON "Hotline"("isActive");
