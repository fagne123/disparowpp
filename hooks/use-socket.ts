'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface SocketEvents {
  'instance:qr': (data: { instanceId: string; qrCode: string }) => void
  'instance:connected': (data: { instanceId: string; phoneNumber?: string }) => void
  'instance:disconnected': (data: { instanceId: string; reason?: string }) => void
  'instance:status:update': (data: { instanceId: string; status: any }) => void
  'instance:auth:failure': (data: { instanceId: string; error: string }) => void
  'message:received': (data: { instanceId: string; message: any }) => void
  'message:sent': (data: { instanceId: string; message: any }) => void
  'instance:connect:success': (data: { instanceId: string }) => void
  'instance:connect:error': (data: { instanceId: string; error: string }) => void
  'instance:disconnect:success': (data: { instanceId: string }) => void
  'instance:disconnect:error': (data: { instanceId: string; error: string }) => void
}

export function useSocket() {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.companyId) return

    // Initialize socket connection
    const socket = io('http://localhost:3000', {
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)
      setConnectionError(null)

      // Join company room
      socket.emit('join:company', { companyId: session.user.companyId })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [session?.user?.companyId])

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  const on = <T extends keyof SocketEvents>(
    event: T,
    callback: SocketEvents[T]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = <T extends keyof SocketEvents>(
    event: T,
    callback?: SocketEvents[T]
  ) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  // Instance management methods
  const connectInstance = (instanceId: string) => {
    emit('instance:connect', {
      instanceId,
      companyId: session?.user?.companyId
    })
  }

  const disconnectInstance = (instanceId: string) => {
    emit('instance:disconnect', { instanceId })
  }

  const getInstanceStatus = (instanceId: string) => {
    emit('instance:status:get', { instanceId })
  }

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    connectInstance,
    disconnectInstance,
    getInstanceStatus,
  }
}


