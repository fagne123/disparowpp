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
  Zap
} from 'lucide-react'

export default function TestQRDirectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testQRCreation = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test-qr-creation', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
      
    } catch (error) {
      setResult({
        success: false,
        error: error.toString()
      })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🧪 Teste Direto QR Code
          </h1>
          <p className="text-xl text-gray-600">
            Teste direto da Evolution API para identificar o problema
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">Direct Test</Badge>
            <Badge className="bg-pink-100 text-pink-800">Evolution API</Badge>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">🔬 Teste Direto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testQRCreation} 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Testar Criação de QR Code
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {result.success ? (
                    <div className="space-y-2">
                      <div><strong className="text-green-800">✅ Teste bem-sucedido!</strong></div>
                      <div><strong>Instance ID:</strong> {result.testInstanceId}</div>
                      <div><strong>QR Code encontrado:</strong> {result.qrCodeFound ? 'SIM' : 'NÃO'}</div>
                      {result.qrCodeFound && (
                        <>
                          <div><strong>Tamanho:</strong> {result.qrCodeLength} chars</div>
                          <div><strong>Preview:</strong> {result.qrCodePreview}...</div>
                        </>
                      )}
                      <div><strong>Chaves disponíveis:</strong> {result.availableKeys.join(', ')}</div>
                      {result.qrcodeKeys.length > 0 && (
                        <div><strong>Chaves QR Code:</strong> {result.qrcodeKeys.join(', ')}</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <strong className="text-red-800">❌ Teste falhou</strong>
                      <br />
                      <span className="text-red-700">{result.error}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* QR Code Display */}
        {result?.success && result?.qrCodeFound && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">📱 QR Code Encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <img 
                  src={result.evolutionData.qrcode.base64} 
                  alt="QR Code Teste Direto" 
                  className="mx-auto border-2 border-green-300 rounded-lg shadow-lg max-w-full"
                  onError={(e) => {
                    console.error('QR Code image failed to load:', e)
                  }}
                  onLoad={() => {
                    console.log('QR Code image loaded successfully!')
                  }}
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">
                    ✅ QR Code carregado diretamente da Evolution API!
                  </p>
                  <p className="text-xs text-gray-600">
                    Tamanho: {result.qrCodeLength} caracteres
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw Data */}
        {result && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-700">📋 Dados Brutos</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700">🎯 O que este teste faz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Chama diretamente o evolutionManager.createInstance()</p>
              <p>• Verifica se os dados são retornados corretamente</p>
              <p>• Mostra a estrutura exata dos dados</p>
              <p>• Testa se o QR Code está presente</p>
              <p>• Exibe o QR Code se encontrado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
