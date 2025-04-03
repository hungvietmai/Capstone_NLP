import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  const [history, suggestions] = await Promise.all([
    prisma.searchHistory.findMany({
      where: q
        ? {
            query: {
              startsWith: q,
              mode: 'insensitive',
            },
          }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    prisma.suggestion.findMany({
      where: q
        ? {
            text: {
              startsWith: q,
              mode: 'insensitive',
            },
          }
        : {}, // no filter if q is empty
      orderBy: { text: 'asc' },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    history,
    suggestions,
  });
}
