import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(request: Request) {
  try {
    const { hostName } = await request.json();
    if (!hostName || typeof hostName !== 'string' || hostName.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const code = generateCode();
    const playerId = crypto.randomUUID();
    const players = [{ id: playerId, name: hostName.trim(), isHost: true }];

    await prisma.room.create({
      data: { code, hostName: hostName.trim(), players },
    });

    return NextResponse.json({ code, playerId, players });
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
