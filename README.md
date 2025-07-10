# DisparoWPP - Sistema de Disparo Inteligente via WhatsApp

Plataforma completa para envio automatizado de mensagens em massa via WhatsApp Business, com foco em segurança, personalização e prevenção de bloqueios.

## 🚀 Características Principais

- **Multi-Instâncias**: Gerencie múltiplas contas WhatsApp simultaneamente
- **Proteção Anti-Bloqueio**: Delays inteligentes, rotatividade entre contas e sistema de aquecimento
- **Dashboard Completo**: Relatórios em tempo real, métricas de performance e controle total
- **IA Integrada**: Assistente inteligente para criação de mensagens e respostas automáticas
- **Gestão Empresarial**: Sistema multi-tenant com controle de acesso por empresa
- **Comunicação em Tempo Real**: WebSocket para atualizações instantâneas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io, WhatsApp Web.js
- **Banco de Dados**: MongoDB com Mongoose
- **Autenticação**: NextAuth.js
- **UI Components**: Radix UI, Lucide Icons
- **Automação**: Puppeteer para controle do WhatsApp Web

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- MongoDB (local ou remoto)
- Google Chrome instalado (para Puppeteer)

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/disparowpp.git
cd disparowpp
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o MongoDB

O sistema já está configurado para usar o MongoDB fornecido:
```
mongodb://admin:admin@206.183.130.252:27017/disparaifagne1?authSource=admin
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://admin:admin@206.183.130.252:27017/disparaifagne1?authSource=admin

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_CHROME_PATH=/usr/bin/google-chrome

# Socket.io Configuration
SOCKET_IO_PORT=3001

# OpenAI Configuration (opcional)
OPENAI_API_KEY=sua-chave-openai

# Application Configuration
NEXTAUTH_SECRET=seu-secret-aqui
NEXTAUTH_URL=http://localhost:3000
```

### 5. Popule o banco de dados

```bash
npm run seed
```

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

### 7. Teste a conexão

Acesse [http://localhost:3000/api/health](http://localhost:3000/api/health) para verificar se o MongoDB está conectado.

### 8. Credenciais de Teste

Após executar o seed, você pode fazer login com:

**Super Admin:**
- Email: `admin@disparowpp.com`
- Senha: `admin123`

**Usuário Teste:**
- Email: `teste@empresa.com`
- Senha: `teste123`

## 📁 Estrutura do Projeto

```
disparowpp/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   └── admin/             # Painel administrativo
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   ├── auth/             # Componentes de autenticação
│   ├── dashboard/        # Componentes do dashboard
│   └── instances/        # Componentes de instâncias WhatsApp
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   ├── whatsapp/         # Gerenciamento WhatsApp
│   └── socket/           # Servidor Socket.io
├── hooks/                # React Hooks customizados
├── types/                # Definições TypeScript
└── supabase/             # Scripts SQL
```

## 🔐 Autenticação e Autorização

O sistema possui três níveis de acesso:

- **Super Admin**: Acesso total ao sistema, gerencia empresas
- **Company Admin**: Gerencia usuários e configurações da empresa
- **Company User**: Acesso limitado às funcionalidades básicas

## 📱 Funcionalidades WhatsApp

### Gerenciamento de Instâncias
- Criação e configuração de múltiplas instâncias
- Autenticação via QR Code
- Monitoramento de status em tempo real
- Sistema de logs detalhado

### Envio de Mensagens
- Campanhas em massa com personalização
- Delays inteligentes para evitar bloqueios
- Rotatividade automática entre instâncias
- Suporte a mídia (imagens, vídeos, documentos)

### Proteção Anti-Bloqueio
- Aquecimento gradual de contas novas
- Limites diários configuráveis
- Detecção automática de banimentos
- Sistema de proxy (configurável)

## 🤖 Integração com IA

O sistema suporta integração com OpenAI para:
- Geração automática de mensagens
- Respostas inteligentes
- Análise de sentimento
- Otimização de campanhas

## 📊 Dashboard e Relatórios

- Métricas em tempo real
- Gráficos de performance
- Relatórios de entrega
- Análise de campanhas
- Logs detalhados

## 🔄 Comunicação em Tempo Real

Utilizando Socket.io para:
- Status das instâncias WhatsApp
- Progresso das campanhas
- Notificações instantâneas
- Atualizações de QR Code

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

```bash
# Build da imagem
docker build -t disparowpp .

# Execute o container
docker run -p 3000:3000 --env-file .env.local disparowpp
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Aviso Legal

Este software é fornecido "como está" e deve ser usado de acordo com os Termos de Serviço do WhatsApp. O uso inadequado pode resultar no banimento de contas. Use com responsabilidade.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@disparowpp.com
- Discord: [Link do Discord]
- Documentação: [Link da Documentação]

---

Desenvolvido com ❤️ para a comunidade brasileira de marketing digital.
