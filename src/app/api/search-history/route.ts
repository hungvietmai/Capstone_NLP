import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id || typeof id !== 'number') {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  await prisma.searchHistory.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
