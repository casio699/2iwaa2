import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (type) {
      case 'shelters':
        return await getShelters(limit, offset);
      case 'hotlines':
        return await getHotlines(limit, offset);
      case 'news':
        return await getNews(limit, offset);
      case 'threats':
        return await getThreats(limit, offset);
      case 'financial':
        return await getFinancialRates(limit, offset);
      case 'housing':
        return await getHousing(limit, offset);
      case 'help':
        return await getHelpPosts(limit, offset);
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getShelters(limit: number, offset: number) {
  const shelters = await prisma.shelter.findMany({
    where: { reviewStatus: 'verified' },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.shelter.count({
    where: { reviewStatus: 'verified' }
  });

  return NextResponse.json({
    data: shelters,
    pagination: { total, limit, offset },
    success: true
  });
}

async function getHotlines(limit: number, offset: number) {
  const hotlines = await prisma.hotline.findMany({
    where: { isActive: true },
    take: limit,
    skip: offset,
    orderBy: { displayOrder: 'asc' }
  });

  const total = await prisma.hotline.count({
    where: { isActive: true }
  });

  return NextResponse.json({
    data: hotlines,
    pagination: { total, limit, offset },
    success: true
  });
}

async function getNews(limit: number, offset: number) {
  const news = await prisma.newsArticle.findMany({
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
      category: true,
      tags: true,
      publishedAt: true,
      isBreaking: true,
      isVerified: true,
      viewCount: true
    }
  });

  const total = await prisma.newsArticle.count();

  return NextResponse.json({
    data: news,
    pagination: { total, limit, offset },
    success: true
  });
}

async function getThreats(limit: number, offset: number) {
  const threats = await prisma.threat.findMany({
    take: limit,
    skip: offset,
    orderBy: { reportedAt: 'desc' },
    where: { status: { not: 'false_alarm' } }
  });

  const total = await prisma.threat.count({
    where: { status: { not: 'false_alarm' } }
  });

  return NextResponse.json({
    data: threats,
    pagination: { total, limit, offset },
    success: true
  });
}

async function getFinancialRates(limit: number, offset: number) {
  const rates = await prisma.financialRate.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    distinct: ['type']
  });

  const total = await prisma.financialRate.groupBy({
    by: ['type'],
    _count: { type: true }
  }).then(result => result.length);

  return NextResponse.json({
    data: rates,
    pagination: { total, limit, offset },
    success: true
  });
}

async function getHousing(limit: number, offset: number) {
  const housing = await prisma.housing.findMany({
    where: { isAvailable: true, verified: true },
    take: limit,
    skip: offset,
    orderBy: { featured: 'desc', createdAt: 'desc' },
    include: {
      reviews: {
        where: { verified: true },
        take: 3,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const total = await prisma.housing.count({
    where: { isAvailable: true, verified: true }
  });

  return NextResponse.json({
    data: housing,
    pagination: { total, limit, offset },
    success: true
  });
}

async function getHelpPosts(limit: number, offset: number) {
  const helpPosts = await prisma.helpPost.findMany({
    where: { status: 'active' },
    take: limit,
    skip: offset,
    orderBy: { urgency: 'desc', createdAt: 'desc' }
  });

  const total = await prisma.helpPost.count({
    where: { status: 'active' }
  });

  return NextResponse.json({
    data: helpPosts,
    pagination: { total, limit, offset },
    success: true
  });
}
