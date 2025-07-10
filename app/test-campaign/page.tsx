'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestCampaignPage() {
  const [name, setName] = useState('Teste Campanha')
  const [message, setMessage] = useState('Olá {nome}, esta é uma mensagem de teste!')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testCampaign = async () => {
    setIsLoading(true)
    setResult(null)

    const testData = {
      name,
      description: 'Campanha de teste criada automaticamente',
      messageTemplate: message,
      mediaType: 'text',
      contactSelection: 'all',
      selectedGroups: [],
      uploadedContacts: [],
      sendConfig: {
        delayBetweenMessages: 5,
        maxMessagesPerInstance: 100,
        instanceIds: ['test-instance'],
        retryFailedMessages: true,
        maxRetries: 3
      },
      scheduleType: 'now',
      settings: {
        personalizeMessage: true,
        variables: ['nome'],
        blacklistCheck: true,
        duplicateCheck: true
      }
    }

    try {
      console.log('Sending test data:', testData)
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      
      setResult({
        success: response.ok,
        status: response.status,
        data
      })

      console.log('Response:', { status: response.status, data })

    } catch (error) {
      setResult({
        success: false,
        error: error.toString()
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste de Criação de Campanha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Campanha</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da campanha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mensagem</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensagem da campanha"
                rows={3}
              />
            </div>

            <Button 
              onClick={testCampaign}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Testar Criação'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? '✅ Sucesso' : '❌ Erro'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>📋 Dados que serão enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{`{
  "name": "${name}",
  "description": "Campanha de teste criada automaticamente",
  "messageTemplate": "${message}",
  "mediaType": "text",
  "contactSelection": "all",
  "selectedGroups": [],
  "uploadedContacts": [],
  "sendConfig": {
    "delayBetweenMessages": 5,
    "maxMessagesPerInstance": 100,
    "instanceIds": ["test-instance"],
    "retryFailedMessages": true,
    "maxRetries": 3
  },
  "scheduleType": "now",
  "settings": {
    "personalizeMessage": true,
    "variables": ["nome"],
    "blacklistCheck": true,
    "duplicateCheck": true
  }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
