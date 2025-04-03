import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }

    // Save to search history
    await prisma.searchHistory.create({
      data: { query },
    });

    // Call external AI API 
    const aiResponse = await fakeAIService(query);

    return NextResponse.json({
      query,
      result: aiResponse,
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Tạm thời chưa có service
async function fakeAIService(query: string) {
  return {
    title: `Thông tin về "${query}"`,
    content: `Đây là nội dung mô phỏng cho bệnh lý "${query}". Bạn có thể thay thế bằng dữ liệu thật từ AI.`,
  };
}