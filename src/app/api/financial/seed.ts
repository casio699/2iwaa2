import { prisma } from "@/lib/prisma";

// Mock financial data to seed the database
const mockFinancialData = [
  {
    type: "lira_official",
    value: 15000,
    currency: "LBP",
    sourceName: "مصرف لبنان",
    sourceUrl: "https://bdl.gov.lb",
    previousValue: 15000,
    changePercent: 0,
  },
  {
    type: "lira_black",
    value: 85000,
    currency: "LBP",
    sourceName: "LiraRate",
    sourceUrl: "https://lirate.com",
    previousValue: 83000,
    changePercent: 2.41,
  },
  {
    type: "lira_sayrafa",
    value: 88000,
    currency: "LBP",
    sourceName: "منصة صيرفة",
    sourceUrl: "https://sayrafa.gov.lb",
    previousValue: 87500,
    changePercent: 0.57,
  },
  {
    type: "fuel_95",
    value: 38000,
    currency: "LBP",
    sourceName: "وزارة الطاقة",
    sourceUrl: "https://energy.gov.lb",
    previousValue: 37000,
    changePercent: 2.70,
  },
  {
    type: "fuel_98",
    value: 40000,
    currency: "LBP",
    sourceName: "وزارة الطاقة",
    sourceUrl: "https://energy.gov.lb",
    previousValue: 39000,
    changePercent: 2.56,
  },
  {
    type: "fuel_diesel",
    value: 35000,
    currency: "LBP",
    sourceName: "وزارة الطاقة",
    sourceUrl: "https://energy.gov.lb",
    previousValue: 34000,
    changePercent: 2.94,
  },
  {
    type: "gold_24k",
    value: 75.50,
    currency: "USD",
    sourceName: "World Gold Council",
    sourceUrl: "https://gold.org",
    previousValue: 74.80,
    changePercent: 0.94,
  },
  {
    type: "gold_21k",
    value: 66.06,
    currency: "USD",
    sourceName: "World Gold Council",
    sourceUrl: "https://gold.org",
    previousValue: 65.45,
    changePercent: 0.93,
  },
];

export async function seedFinancialData() {
  try {
    console.log("Seeding financial data...");
    
    for (const data of mockFinancialData) {
      await prisma.$executeRaw`
        INSERT INTO "FinancialRate" (
          id, type, value, currency, "sourceName", "sourceUrl",
          "previousValue", "changePercent", region, notes, "createdAt"
        ) VALUES (
          gen_random_uuid()::TEXT,
          ${data.type},
          ${data.value},
          ${data.currency},
          ${data.sourceName},
          ${data.sourceUrl},
          ${data.previousValue},
          ${data.changePercent},
          'Lebanon',
          NULL,
          NOW()
        )
      `;
    }
    
    console.log("Financial data seeded successfully!");
  } catch (error) {
    console.error("Error seeding financial data:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedFinancialData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
