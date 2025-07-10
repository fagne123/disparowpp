'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Info } from 'lucide-react'

interface CampaignData {
  name: string
  description: string
  [key: string]: any
}

interface CampaignBasicInfoProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

export function CampaignBasicInfo({ data, onUpdate }: CampaignBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Informações Básicas da Campanha
        </h3>
        <p className="text-gray-600">
          Defina o nome e descrição da sua campanha
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="campaignName">
              Nome da Campanha *
            </Label>
            <Input
              id="campaignName"
              value={data.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Ex: Promoção Black Friday 2024"
              className="mt-1"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {data.name.length}/100 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="campaignDescription">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="campaignDescription"
              value={data.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Descreva o objetivo desta campanha..."
              className="mt-1"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {data.description.length}/500 caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                💡 Dicas para nomear sua campanha
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use nomes descritivos e únicos</li>
                <li>• Inclua a data ou período (ex: "Natal 2024")</li>
                <li>• Mencione o objetivo (ex: "Promoção", "Lembrete")</li>
                <li>• Evite caracteres especiais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {data.name && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 text-sm">
              📋 Preview da Campanha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-green-700">Nome:</span>
                <p className="text-green-800">{data.name}</p>
              </div>
              {data.description && (
                <div>
                  <span className="text-sm font-medium text-green-700">Descrição:</span>
                  <p className="text-green-800 text-sm">{data.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
