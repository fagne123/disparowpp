import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { CampaignsList } from '@/components/campaigns/campaigns-list'
import { CampaignStats } from '@/components/campaigns/campaign-stats'
import { CreateCampaignButton } from '@/components/campaigns/create-campaign-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  BarChart3,
  Send,
  Users,
  Clock,
  TrendingUp,
  Megaphone
} from 'lucide-react'

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📢 Campanhas
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Crie e gerencie suas campanhas de WhatsApp
            </p>
          </div>

          <CreateCampaignButton />
        </div>

        {/* Stats Cards */}
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>}>
          <CampaignStats />
        </Suspense>

        {/* Campaigns List */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Suas Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            }>
              <CampaignsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
