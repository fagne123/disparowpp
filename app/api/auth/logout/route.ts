import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // NextAuth handles logout automatically through the signOut function
  // This endpoint is just for consistency
  return NextResponse.json({ message: 'Logout successful' })
}
