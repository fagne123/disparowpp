'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Image, 
  FileText, 
  Eye,
  Info,
  Sparkles
} from 'lucide-react'

interface CampaignData {
  messageTemplate: string
  mediaUrl?: string
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  settings: {
    personalizeMessage: boolean
    variables: string[]
  }
  [key: string]: any
}

interface CampaignMessageProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

export function CampaignMessage({ data, onUpdate }: CampaignMessageProps) {
  const [previewMode, setPreviewMode] = useState(false)

  const handleMessageChange = (message: string) => {
    onUpdate({ messageTemplate: message })
  }

  const handleMediaTypeChange = (type: CampaignData['mediaType']) => {
    onUpdate({ mediaType: type })
  }

  const insertVariable = (variable: string) => {
    const newMessage = data.messageTemplate + `{${variable}}`
    handleMessageChange(newMessage)
  }

  const previewMessage = () => {
    let preview = data.messageTemplate
    data.settings.variables.forEach(variable => {
      const placeholder = `{${variable}}`
      const sampleValue = variable === 'nome' ? 'João Silva' : 
                         variable === 'empresa' ? 'Empresa XYZ' : 
                         `[${variable}]`
      preview = preview.replace(new RegExp(`\\{${variable}\\}`, 'g'), sampleValue)
    })
    return preview
  }

  const mediaTypes = [
    { id: 'text', label: 'Apenas Texto', icon: MessageSquare },
    { id: 'image', label: 'Imagem', icon: Image },
    { id: 'document', label: 'Documento', icon: FileText }
  ]

  const commonVariables = ['nome', 'empresa', 'telefone', 'email']

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Criar Mensagem da Campanha
        </h3>
        <p className="text-gray-600">
          Escreva a mensagem que será enviada para seus contatos
        </p>
      </div>

      {/* Tipo de Mídia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Tipo de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {mediaTypes.map((type) => {
              const Icon = type.icon
              const isSelected = data.mediaType === type.id
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleMediaTypeChange(type.id as CampaignData['mediaType'])}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{type.label}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* URL da Mídia */}
      {data.mediaType !== 'text' && (
        <Card>
          <CardHeader>
            <CardTitle>URL da Mídia</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="mediaUrl">
                URL do {data.mediaType === 'image' ? 'Imagem' : 'Arquivo'}
              </Label>
              <Input
                id="mediaUrl"
                value={data.mediaUrl || ''}
                onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                placeholder="https://exemplo.com/arquivo.jpg"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole a URL pública do arquivo que deseja enviar
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor de Mensagem */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagem
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={previewMode ? "outline" : "default"}
                size="sm"
                onClick={() => setPreviewMode(false)}
              >
                Editar
              </Button>
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewMode ? (
            <>
              <div>
                <Label htmlFor="messageTemplate">
                  Texto da Mensagem *
                </Label>
                <Textarea
                  id="messageTemplate"
                  value={data.messageTemplate}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  className="mt-1 min-h-[120px]"
                  maxLength={4096}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {data.messageTemplate.length}/4096 caracteres
                  </p>
                  <p className="text-xs text-gray-500">
                    Use {'{nome}'} para personalizar
                  </p>
                </div>
              </div>

              {/* Variáveis */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4" />
                  Variáveis de Personalização
                </Label>
                <div className="flex flex-wrap gap-2">
                  {commonVariables.map((variable) => (
                    <Button
                      key={variable}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                      className="text-xs"
                    >
                      + {variable}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Clique para inserir variáveis na mensagem
                </p>
              </div>
            </>
          ) : (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                Preview da Mensagem
              </Label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">
                    {previewMessage() || 'Digite uma mensagem para ver o preview...'}
                  </p>
                  {data.mediaUrl && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                      📎 {data.mediaType}: {data.mediaUrl}
                    </div>
                  )}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Assim sua mensagem aparecerá no WhatsApp
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                💡 Dicas para mensagens eficazes
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use {'{nome}'} para personalizar a mensagem</li>
                <li>• Mantenha a mensagem clara e objetiva</li>
                <li>• Inclua um call-to-action (CTA) claro</li>
                <li>• Evite palavras que podem ser consideradas spam</li>
                <li>• Teste a mensagem antes de enviar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
