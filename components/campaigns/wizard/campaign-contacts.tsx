'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Upload, 
  UserCheck, 
  FileSpreadsheet,
  Info,
  CheckCircle
} from 'lucide-react'

interface CampaignData {
  contactSelection: 'all' | 'groups' | 'upload'
  selectedGroups: string[]
  uploadedContacts: any[]
  [key: string]: any
}

interface CampaignContactsProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

export function CampaignContacts({ data, onUpdate }: CampaignContactsProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const selectionOptions = [
    {
      id: 'all',
      title: 'Todos os Contatos',
      description: 'Enviar para todos os contatos ativos',
      icon: Users,
      count: '1,234 contatos' // TODO: Buscar do banco
    },
    {
      id: 'groups',
      title: 'Grupos Específicos',
      description: 'Selecionar grupos de contatos',
      icon: UserCheck,
      count: '5 grupos disponíveis'
    },
    {
      id: 'upload',
      title: 'Upload de Lista',
      description: 'Importar arquivo CSV/Excel',
      icon: Upload,
      count: 'Arquivo CSV ou Excel'
    }
  ]

  const availableGroups = [
    { id: '1', name: 'Clientes VIP', count: 150 },
    { id: '2', name: 'Leads Qualificados', count: 320 },
    { id: '3', name: 'Prospects', count: 89 },
    { id: '4', name: 'Clientes Inativos', count: 45 },
    { id: '5', name: 'Parceiros', count: 23 }
  ]

  const handleSelectionChange = (selection: CampaignData['contactSelection']) => {
    onUpdate({ 
      contactSelection: selection,
      selectedGroups: [],
      uploadedContacts: []
    })
  }

  const handleGroupToggle = (groupId: string) => {
    const newGroups = data.selectedGroups.includes(groupId)
      ? data.selectedGroups.filter(id => id !== groupId)
      : [...data.selectedGroups, groupId]
    
    onUpdate({ selectedGroups: newGroups })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // TODO: Processar arquivo CSV/Excel
      onUpdate({ uploadedContacts: [] }) // Placeholder
    }
  }

  const getTotalContacts = () => {
    switch (data.contactSelection) {
      case 'all':
        return 1234 // TODO: Buscar do banco
      case 'groups':
        return data.selectedGroups.reduce((total, groupId) => {
          const group = availableGroups.find(g => g.id === groupId)
          return total + (group?.count || 0)
        }, 0)
      case 'upload':
        return data.uploadedContacts.length
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecionar Destinatários
        </h3>
        <p className="text-gray-600">
          Escolha quais contatos receberão sua campanha
        </p>
      </div>

      {/* Opções de Seleção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectionOptions.map((option) => {
          const Icon = option.icon
          const isSelected = data.contactSelection === option.id
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelectionChange(option.id as CampaignData['contactSelection'])}
            >
              <CardContent className="p-6 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-3 ${
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h3 className={`font-semibold mb-2 ${
                  isSelected ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {option.title}
                </h3>
                <p className={`text-sm mb-2 ${
                  isSelected ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
                <Badge variant={isSelected ? "default" : "secondary"}>
                  {option.count}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Seleção de Grupos */}
      {data.contactSelection === 'groups' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Selecionar Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableGroups.map((group) => {
                const isSelected = data.selectedGroups.includes(group.id)
                
                return (
                  <div
                    key={group.id}
                    onClick={() => handleGroupToggle(group.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          isSelected ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {group.name}
                        </h4>
                        <p className={`text-sm ${
                          isSelected ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {group.count} contatos
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {data.selectedGroups.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                Selecione pelo menos um grupo
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload de Arquivo */}
      {data.contactSelection === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload de Contatos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactFile">
                Arquivo de Contatos (CSV ou Excel)
              </Label>
              <Input
                id="contactFile"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: CSV, Excel (.xlsx, .xls)
              </p>
            </div>

            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      Arquivo carregado: {uploadedFile.name}
                    </p>
                    <p className="text-sm text-green-700">
                      Processando contatos... (funcionalidade em desenvolvimento)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Formato do arquivo CSV
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Colunas obrigatórias:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>nome - Nome do contato</li>
                    <li>telefone - Número com DDD (ex: 11999999999)</li>
                  </ul>
                  <p className="mt-2"><strong>Colunas opcionais:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>email - E-mail do contato</li>
                    <li>empresa - Nome da empresa</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">
                📊 Resumo da Seleção
              </h4>
              <p className="text-green-700">
                <strong>{getTotalContacts().toLocaleString()}</strong> contatos serão incluídos nesta campanha
              </p>
              {data.contactSelection === 'groups' && data.selectedGroups.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Grupos selecionados: {data.selectedGroups.length}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
