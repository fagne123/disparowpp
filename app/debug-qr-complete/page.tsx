'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Bug,
  Database,
  Server
} from 'lucide-react'

export default function DebugQRCompletePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [debugData, setDebugData] = useState<any>(null)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-25), `${time} ${emoji} ${message}`])
  }

  const runCompleteDebug = async () => {
    setIsLoading(true)
    setLogs([])
    setDebugData(null)
    
    addLog('🔍 Iniciando debug completo do QR Code...', 'info')
    
    try {
      // Step 1: Check database instances
      addLog('📊 Verificando instâncias no banco de dados...', 'info')
      const dbResponse = await fetch('/api/debug-qr')
      const dbData = await dbResponse.json()
      
      if (dbData.success) {
        addLog(`✅ Encontradas ${dbData.totalInstances} instâncias no banco`, 'success')
        const withQR = dbData.instances.filter((i: any) => i.hasQrCode).length
        addLog(`📱 ${withQR} instâncias têm QR Code salvo`, 'info')
        
        if (dbData.instances.length > 0) {
          const latest = dbData.instances[0]
          addLog(`🔍 Última instância: ${latest.id} (${latest.status})`, 'info')
          
          if (latest.hasQrCode) {
            addLog(`📱 QR Code encontrado! Tamanho: ${latest.qrCodeLength} chars`, 'success')
            
            // Step 2: Test QR API for this instance
            addLog(`🧪 Testando API de QR Code para ${latest.id}...`, 'info')
            const qrResponse = await fetch(`/api/instances/${latest.id}/qr`)
            const qrData = await qrResponse.json()
            
            if (qrResponse.ok) {
              addLog(`✅ API de QR Code funcionou! Fonte: ${qrData.source}`, 'success')
              addLog(`📱 QR Code recebido: ${qrData.qrCode ? 'SIM' : 'NÃO'}`, qrData.qrCode ? 'success' : 'error')
              
              if (qrData.qrCode) {
                addLog(`📏 Tamanho do QR Code: ${qrData.qrCode.length} chars`, 'info')
                addLog(`🔍 Início do QR Code: ${qrData.qrCode.substring(0, 50)}...`, 'info')
                
                // Test if it's a valid data URL
                if (qrData.qrCode.startsWith('data:image/')) {
                  addLog(`✅ QR Code é uma data URL válida!`, 'success')
                  setDebugData({
                    instanceId: latest.id,
                    qrCode: qrData.qrCode,
                    source: qrData.source,
                    isValid: true
                  })
                } else {
                  addLog(`❌ QR Code não é uma data URL válida`, 'error')
                  setDebugData({
                    instanceId: latest.id,
                    qrCode: qrData.qrCode,
                    source: qrData.source,
                    isValid: false
                  })
                }
              }
            } else {
              addLog(`❌ API de QR Code falhou: ${qrData.message}`, 'error')
            }
          } else {
            addLog(`⚠️ Instância não tem QR Code salvo`, 'error')
            
            // Step 3: Create new instance for testing
            addLog(`🔧 Criando nova instância para teste...`, 'info')
            const createResponse = await fetch('/api/instances', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: `DebugQR_${Date.now()}` })
            })
            
            const createData = await createResponse.json()
            
            if (createResponse.ok) {
              const newId = createData.instance._id
              addLog(`✅ Nova instância criada: ${newId}`, 'success')
              
              // Wait and check for QR
              addLog(`⏳ Aguardando 5 segundos para QR Code ser gerado...`, 'info')
              await new Promise(resolve => setTimeout(resolve, 5000))
              
              const newQrResponse = await fetch(`/api/instances/${newId}/qr`)
              const newQrData = await newQrResponse.json()
              
              if (newQrResponse.ok && newQrData.qrCode) {
                addLog(`✅ QR Code da nova instância funcionou!`, 'success')
                setDebugData({
                  instanceId: newId,
                  qrCode: newQrData.qrCode,
                  source: newQrData.source,
                  isValid: newQrData.qrCode.startsWith('data:image/')
                })
              } else {
                addLog(`❌ QR Code da nova instância falhou`, 'error')
              }
            } else {
              addLog(`❌ Falha ao criar nova instância: ${createData.message}`, 'error')
            }
          }
        } else {
          addLog(`⚠️ Nenhuma instância encontrada no banco`, 'error')
        }
      } else {
        addLog(`❌ Erro ao verificar banco: ${dbData.message}`, 'error')
      }
      
    } catch (error) {
      addLog(`❌ Erro no debug: ${error}`, 'error')
    }
    
    setIsLoading(false)
    addLog('🏁 Debug completo finalizado!', 'info')
  }

  const testDirectEvolution = async () => {
    addLog('🧪 Testando Evolution API diretamente...', 'info')
    
    try {
      const response = await fetch('/api/test-evolution-direct')
      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Evolution API funcionando: ${data.instanceCount} instâncias`, 'success')
      } else {
        addLog(`❌ Evolution API com problema: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro ao testar Evolution API: ${error}`, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            🐛 Debug Completo QR Code
          </h1>
          <p className="text-xl text-gray-600">
            Diagnóstico completo para identificar o problema do QR Code
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-red-100 text-red-800">Debug Mode</Badge>
            <Badge className="bg-orange-100 text-orange-800">Full Diagnostic</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <Bug className="h-5 w-5 mr-2" />
                Debug Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={runCompleteDebug} 
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Debugando...
                    </>
                  ) : (
                    <>
                      <Bug className="h-4 w-4 mr-2" />
                      Debug Completo
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={testDirectEvolution} 
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Server className="h-4 w-4 mr-2" />
                    Test Evolution
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/api/debug-qr', '_blank')} 
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Check DB
                  </Button>
                </div>
              </div>

              {debugData && (
                <Alert className={debugData.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {debugData.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-1">
                      <div><strong>Instance:</strong> {debugData.instanceId}</div>
                      <div><strong>Source:</strong> {debugData.source}</div>
                      <div><strong>Valid:</strong> {debugData.isValid ? 'YES' : 'NO'}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* QR Code Display */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">📱 QR Code Test</CardTitle>
            </CardHeader>
            <CardContent>
              {debugData?.qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={debugData.qrCode} 
                    alt="QR Code Debug" 
                    className="mx-auto border-2 border-green-300 rounded-lg shadow-lg max-w-full"
                    onError={(e) => {
                      console.error('QR Code image failed to load:', e)
                      addLog('❌ Falha ao carregar imagem do QR Code', 'error')
                    }}
                    onLoad={() => {
                      addLog('✅ Imagem do QR Code carregada com sucesso!', 'success')
                    }}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">
                      {debugData.isValid ? '✅ QR Code válido!' : '❌ QR Code inválido'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Fonte: {debugData.source}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">🔍</div>
                  <p>Execute o debug para testar QR Code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">📋 Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  🐛 Logs de debug aparecerão aqui...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700">🎯 O que este debug faz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🔍 Verificações:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Verifica instâncias no banco de dados</li>
                  <li>Testa API de QR Code</li>
                  <li>Valida formato da data URL</li>
                  <li>Cria nova instância se necessário</li>
                  <li>Testa carregamento da imagem</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🎯 Diagnósticos:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• QR Code está sendo salvo?</li>
                  <li>• API está retornando dados?</li>
                  <li>• Formato está correto?</li>
                  <li>• Imagem carrega no browser?</li>
                  <li>• Onde está o problema?</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
