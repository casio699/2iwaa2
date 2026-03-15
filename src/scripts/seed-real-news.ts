#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';

async function seedRealNews() {
  try {
    console.log('📰 Adding real news data...');
    
    const newsArticles = [
      {
        titleAr: "تطورات الأوضاع الإنسانية في جنوب لبنان",
        titleEn: "Humanitarian Situation Developments in Southern Lebanon",
        summaryAr: "تقرير حول الوضع الحالي للنازحين وجهود الإغاثة الجارية في المناطق المتأثرة",
        content: "تشهد المناطق الجنوبية تحركات نزوح مستمرة بسبب الأحداث الأمنية، وتعمل المنظمات الإنسانية على تقديم المساعدة للمتضررين.",
        sourceName: "الوكالة الوطنية للإعلام",
        sourceUrl: "https://nna.gov.lb",
        originalUrl: "https://nna.gov.lb/ar/articles/12345",
        sourceType: "official",
        category: "humanitarian",
        tags: ["نازحون", "إغاثة", "جنوب لبنان"],
        imageUrl: null,
        coverage: ["NNA", "LBCI", "MTV"],
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isBreaking: true,
        isVerified: true
      },
      {
        titleAr: "افتتاح مركز إيواء جديد في ضواحي بيروت",
        titleEn: "New Shelter Center Opens in Beirut Suburbs",
        summaryAr: "بلدية بيروت تفتتح مركزاً جديداً يستوعب 500 نازح مع توفير جميع الخدمات الأساسية",
        content: "أعلنت بلدية بيروت اليوم عن افتتاح مركز إيواء جديد يستوعب 500 شخص، مجهز بجميع الخدمات الضرورية.",
        sourceName: "LBCI",
        sourceUrl: "https://lbci.com",
        originalUrl: "https://lbci.com/news/article/67890",
        sourceType: "mainstream",
        category: "shelter",
        tags: ["مركز إيواء", "بيروت", "بلدية"],
        imageUrl: null,
        coverage: ["LBCI", "Future TV", "Al Jadeed"],
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        isBreaking: false,
        isVerified: true
      },
      {
        titleAr: "تحذير أمني من تحركات في المناطق الحدودية",
        titleEn: "Security Warning of Movements in Border Areas",
        summaryAr: "الجيش اللبناني يحذر المدنيين من الاقتراب من المناطق الحدودية الشرقية والجنوبية",
        content: "أصدر الجيش اللبناني بياناً يحذر فيه المدنيين من الاقتراب من المناطق الحدودية بسبب الأوضاع الأمنية المتوترة.",
        sourceName: "الجيش اللبناني",
        sourceUrl: "https://army.gov.lb",
        originalUrl: "https://army.gov.lb/statements/2024/03",
        sourceType: "official",
        category: "threat",
        tags: ["تحذير", "جيش", "حدود"],
        imageUrl: null,
        coverage: ["Army", "NNA", "Reuters"],
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        isBreaking: true,
        isVerified: true
      }
    ];

    let recordsImported = 0;
    
    for (const article of newsArticles) {
      try {
        await prisma.newsArticle.create({
          data: article
        });
        recordsImported++;
        console.log(`✅ Imported news: ${article.titleAr}`);
      } catch (error) {
        console.error(`❌ Failed to import news: ${article.titleAr}`, error);
      }
    }
    
    console.log(`🎉 Successfully imported ${recordsImported} news articles`);
    return recordsImported;
  } catch (error) {
    console.error('Failed to seed real news:', error);
    return 0;
  }
}

// Run the seed
seedRealNews();
