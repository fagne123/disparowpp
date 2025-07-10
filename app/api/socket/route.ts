import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Socket.io server is running on custom server',
    path: '/api/socket',
    status: 'active'
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Socket.io events should be sent via WebSocket connection',
    path: '/api/socket'
  })
}
