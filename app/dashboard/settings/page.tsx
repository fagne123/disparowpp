import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save, User, Building, Shield } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">
          Gerencie suas configurações de conta e empresa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <a href="#profile" className="bg-green-50 text-green-700 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <User className="text-green-500 mr-3 h-5 w-5" />
              Perfil
            </a>
            <a href="#company" className="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Building className="text-gray-400 group-hover:text-gray-500 mr-3 h-5 w-5" />
              Empresa
            </a>
            <a href="#security" className="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Shield className="text-gray-400 group-hover:text-gray-500 mr-3 h-5 w-5" />
              Segurança
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Informações do Perfil
              </h3>
              
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    defaultValue={session.user.name}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={session.user.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    type="text"
                    defaultValue={session.user.companyName}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Função</Label>
                  <Input
                    id="role"
                    type="text"
                    defaultValue={session.user.role === 'company_admin' ? 'Administrador' : 'Usuário'}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>

                <div className="pt-4">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Configurações da Empresa */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Configurações da Empresa
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Limite de Instâncias</h4>
                    <p className="text-sm text-gray-500">Máximo de instâncias WhatsApp permitidas</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">5</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Status da Conta</h4>
                    <p className="text-sm text-gray-500">Status atual da sua empresa</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aprovada
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Período de Teste</h4>
                    <p className="text-sm text-gray-500">Tempo restante do período gratuito</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">29 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Funcionalidade:</strong> Configurações básicas implementadas. Alteração de senha e configurações avançadas serão adicionadas em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
