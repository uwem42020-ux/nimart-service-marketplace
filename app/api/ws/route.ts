// app/api/ws/route.ts - FINAL SIMPLE VERSION
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'Use Supabase Realtime for real-time updates',
    realtime_enabled: true,
    tables_enabled: ['messages', 'notifications']
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  })
}