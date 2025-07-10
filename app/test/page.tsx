import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Teste de Componentes</h1>
        
        <Alert>
          <AlertDescription>
            Sistema funcionando corretamente! ✅
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertDescription>
            Este é um alerta de erro para teste.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="test-input">Campo de Teste</Label>
            <Input
              id="test-input"
              placeholder="Digite algo aqui..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button>Botão Padrão</Button>
            <Button variant="outline">Botão Outline</Button>
            <Button variant="destructive">Botão Erro</Button>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary">Secundário</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Todos os componentes UI estão funcionando!</p>
          <p>MongoDB conectado e sistema operacional.</p>
        </div>
      </div>
    </div>
  )
}
