import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import { allocateRoles, getCivilCount } from '@/lib/roles';
import { INITIAL_ROLE_CONFIG } from '@/lib/game-types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    return NextResponse.json({
      code: room.code,
      hostName: room.hostName,
      players: room.players as Array<{ id: string; name: string; isHost: boolean }>,
      gameState: (room.gameState || {}) as Record<string, unknown>,
      status: room.status,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error('Failed to get room:', error);
    return NextResponse.json({ error: 'Failed to get room' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const roomCode = code.toUpperCase();

    // --- JOIN ---
    if (body.action === 'join') {
      const { playerName, playerId: existingId } = body;
      if (!playerName || typeof playerName !== 'string') {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      if (room.status !== 'waiting') return NextResponse.json({ error: 'Game already started' }, { status: 400 });

      const players = room.players as Array<{ id: string; name: string; isHost: boolean }>;
      const trimmedName = playerName.trim();

      let playerId = existingId;
      const existingIndex = existingId ? players.findIndex((p) => p.id === existingId) : -1;
      if (existingIndex !== -1) {
        players[existingIndex].name = trimmedName;
      } else {
        const nameTaken = players.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase());
        if (nameTaken) {
          return NextResponse.json({ error: 'Name already taken' }, { status: 409 });
        }
        playerId = crypto.randomUUID();
        players.push({ id: playerId, name: trimmedName, isHost: false });
      }

      await prisma.room.update({
        where: { code: roomCode },
        data: { players },
      });
      return NextResponse.json({ playerId, players });
    }

    // --- KICK PLAYER ---
    if (body.action === 'kick_player') {
      const { hostId, targetId } = body;
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      if (room.status !== 'waiting') return NextResponse.json({ error: 'Game already started' }, { status: 400 });

      const players = room.players as Array<{ id: string; name: string; isHost: boolean }>;
      const isHostRequest = players.some(p => p.id === hostId && p.isHost);
      if (!isHostRequest) return NextResponse.json({ error: 'Only host can kick players' }, { status: 403 });

      const updatedPlayers = players.filter(p => p.id !== targetId);

      await prisma.room.update({
        where: { code: roomCode },
        data: { players: updatedPlayers },
      });
      return NextResponse.json({ ok: true });
    }

    // --- UPDATE SETTINGS ---
    if (body.action === 'update_settings') {
      const { settings } = body;
      if (!settings || typeof settings !== 'object') {
        return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
      }

      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

      const state = (room.gameState || {}) as Record<string, unknown>;
      state.settings = settings;

      await prisma.room.update({
        where: { code: roomCode },
        data: { gameState: state as Prisma.InputJsonValue },
      });
      return NextResponse.json({ ok: true });
    }

    // --- START GAME ---
    if (body.action === 'start_game') {
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      if (room.status !== 'waiting') return NextResponse.json({ error: 'Game already started' }, { status: 400 });

      const players = room.players as Array<{ id: string; name: string; isHost: boolean }>;
      const state = (room.gameState || {}) as Record<string, unknown>;
      const settings = (state.settings || INITIAL_ROLE_CONFIG) as any;

      if (players.length < 4) return NextResponse.json({ error: 'Need at least 4 players' }, { status: 400 });
      if (getCivilCount(players.length, { mafia: settings.mafia || 1, ...settings }) < 1) {
        return NextResponse.json({ error: 'Not enough civil roles' }, { status: 400 });
      }

      const roleKeys = allocateRoles(players.length, { mafia: settings.mafia || 1, ...settings });
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const roleMap: Record<string, string> = {};
      shuffled.forEach((p, i) => { roleMap[p.id] = roleKeys[i]; });

      state.roles = roleMap;
      state.settings = settings;

      await prisma.room.update({
        where: { code: roomCode },
        data: { gameState: state as Prisma.InputJsonValue, status: 'playing' },
      });
      return NextResponse.json({ ok: true });
    }

    // --- RESET GAME ---
    if (body.action === 'reset_game') {
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      if (room.status !== 'playing') return NextResponse.json({ error: 'Game not started' }, { status: 400 });

      await prisma.room.update({
        where: { code: roomCode },
        data: { gameState: Prisma.JsonNull, status: 'waiting' },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}
