# 🚀 AICodeGen

> Uma plataforma completa de geração de aplicações React usando inteligência artificial

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)

**AICodeGen** é uma plataforma inovadora que permite criar aplicações React completas através de prompts em linguagem natural. Utilizando inteligência artificial avançada, a plataforma gera código production-ready, componentes responsivos e interfaces modernas em segundos.

## 📸 Screenshots

<div align="center">
  <img src="./ai-platform-prototype.png" alt="Dashboard Principal" width="45%">
  <img src="./app-page.png" alt="Interface de Geração" width="45%">
</div>

<div align="center">
  <img src="./login-page.png" alt="Página de Login" width="45%">
  <img src="./generation-progress.png" alt="Progresso de Geração" width="45%">
</div>

## 🎥 Demo

https://github.com/user-attachments/assets/demo-video-placeholder

> 📹 **Demonstração completa**: Veja como criar uma aplicação completa em menos de 2 minutos

## ✨ Funcionalidades

- **Geração de Código com IA**: Integração com Google AI (Gemini) para gerar componentes React reais
- **Interface Moderna**: Dashboard inspirado no Figma com Canvas interativo
- **Autenticação Completa**: Sistema de login/registro com sessões persistentes
- **Sistema de Créditos**: Controle de uso com planos Free/Pro/Enterprise
- **Exportação de Código**: Download de projetos completos em ZIP
- **Responsividade**: Componentes otimizados para desktop, tablet e mobile
- **Tempo Real**: Geração e atualizações em tempo real

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: Hono (TypeScript)
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Sistema de sessões customizado
- **IA**: Google AI (Gemini) para geração de código
- **Rate Limiting**: Proteção contra spam

### Frontend
- **Framework**: React 19 + TypeScript
- **Roteamento**: TanStack Router
- **Estilização**: Tailwind CSS + shadcn/ui
- **Animações**: Framer Motion
- **Estado**: React Hooks + Context API

## 🚀 Setup Rápido

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL (ou Neon Database)
- Google AI API Key

### 2. Instalação Automatizada

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
./setup.sh
```

### 3. Configuração Manual

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar banco de dados:**
```bash
cd apps/server
npm run db:generate
npm run db:push
```

3. **Criar arquivo .env:**
```bash
cp apps/server/.env.example apps/server/.env
# Editar o arquivo .env com suas configurações
```

4. **Executar o projeto:**
```bash
# Terminal 1 - Backend
cd apps/server && npm run dev

# Terminal 2 - Frontend  
cd apps/web && npm run dev
```

## 📋 Configuração do Ambiente

### 1. Banco de Dados

#### Opção A: Neon Database (Recomendado)
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string para o `.env`

#### Opção B: PostgreSQL Local
   ```bash
# Instalar PostgreSQL
# Criar banco de dados
createdb aicodegen
```

### 2. Google AI API

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Crie uma API key
3. Adicione a chave no arquivo `.env`

### 3. Arquivo .env

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/aicodegen"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:3001"

# Google AI Configuration
GOOGLE_AI_API_KEY="sua-chave-da-google-ai-aqui"

# JWT Secret
JWT_SECRET="sua-chave-super-secreta"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testando a Aplicação

### 1. Autenticação
1. Acesse `http://localhost:3001`
2. Clique em "Login"
3. Use qualquer email/senha (demo mode)

### 2. Geração de Código
1. No dashboard, digite um prompt como "Dashboard de e-commerce"
2. Observe a geração em tempo real
3. Verifique as telas no Canvas

### 3. Exportação
1. Gere um projeto
2. Clique em "Export" no header
3. Baixe o ZIP com o código completo

## 📊 Estrutura do Projeto

```
aicodegen/
├── apps/
│   ├── server/          # Backend API
│   │   ├── src/
│   │   │   ├── routes/  # Rotas da API
│   │   │   ├── lib/     # Serviços (AI, Auth, etc.)
│   │   │   └── middleware/
│   │   └── prisma/      # Schema do banco
│   └── web/             # Frontend React
│       ├── src/
│       │   ├── components/
│       │   ├── routes/
│       │   └── hooks/
│       └── public/
├── setup.sh             # Script de setup (Linux/Mac)
├── setup.ps1            # Script de setup (Windows)
└── SETUP.md             # Documentação completa
```

## 🎯 Funcionalidades Implementadas

### ✅ Backend
- [x] API REST com Hono
- [x] Autenticação com sessões
- [x] Sistema de créditos
- [x] Rate limiting
- [x] Integração com Google AI
- [x] Geração de código real
- [x] Banco PostgreSQL + Prisma

### ✅ Frontend
- [x] Interface moderna e responsiva
- [x] Canvas Figma-like
- [x] Preview em tempo real
- [x] Exportação de código
- [x] Sistema de autenticação
- [x] Animações com Framer Motion

### ✅ IA e Geração
- [x] Integração com Google AI
- [x] Geração de componentes React
- [x] Código TypeScript + Tailwind
- [x] Responsividade automática
- [x] Estrutura de projeto completa

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar DATABASE_URL no .env
# Testar conexão
cd apps/server
npm run db:studio
```

### Erro de CORS
```bash
# Verificar CORS_ORIGIN no .env
# Deve ser http://localhost:3001
```

### Erro de Google AI
```bash
# Verificar GOOGLE_AI_API_KEY
# Testar API separadamente
```

### Erro de Build
```bash
# Limpar cache
rm -rf node_modules
npm install
npm run build
```

## 🚀 Deploy

### Backend (Vercel/Railway)
```bash
cd apps/server
npm run build
```

### Frontend (Vercel)
```bash
cd apps/web
npm run build
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Ambos os projetos
npm run dev:server       # Apenas backend
npm run dev:web          # Apenas frontend

# Banco de dados
npm run db:push          # Push do schema
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Gerar cliente Prisma
npm run db:migrate       # Criar migrações

# Build
npm run build            # Build de ambos
npm run check-types      # Verificar tipos TypeScript
```

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este projeto segue as melhores práticas de desenvolvimento e tem como objetivo ser uma referência em geração de código com IA.

### 📋 Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/aicodegen.git`
3. **Crie uma branch** para sua feature: `git checkout -b feature/amazing-feature`
4. **Instale as dependências**: `npm install`
5. **Execute o projeto**: `npm run dev`
6. **Faça suas mudanças** seguindo os padrões do projeto
7. **Teste** suas mudanças: `npm run build && npm run check-types`
8. **Commit** suas mudanças: `git commit -m 'feat: add amazing feature'`
9. **Push** para a branch: `git push origin feature/amazing-feature`
10. **Abra um Pull Request** explicando suas mudanças

### 🔧 Desenvolvimento

```bash
# Configurar ambiente de desenvolvimento
npm install
cp apps/server/.env.example apps/server/.env
# Configure suas variáveis de ambiente

# Executar em modo desenvolvimento
npm run dev

# Executar testes
npm run check-types

# Build para produção
npm run build
```

### 🎯 Áreas que Precisam de Contribuição

- [ ] **Novos modelos de IA** (Claude, GPT-4, etc.)
- [ ] **Templates de componentes** adicionais
- [ ] **Integração com mais APIs** de design
- [ ] **Testes automatizados** (Jest, Cypress)
- [ ] **Documentação** e tutoriais
- [ ] **Otimizações de performance**
- [ ] **Suporte a mais frameworks** (Vue, Angular)
- [ ] **Internacionalização** (i18n)

### 📝 Diretrizes

- Use **Conventional Commits** para mensagens de commit
- Siga o **estilo de código** existente (ESLint + Prettier)
- Adicione **testes** para novas funcionalidades
- Atualize a **documentação** quando necessário
- Use **TypeScript** para tudo
- Mantenha a **compatibilidade** com Node.js 18+

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📚 [Documentação Completa](SETUP.md)
- 🐛 [Issues](https://github.com/seu-usuario/aicodegen/issues)
- 💬 [Discord](https://discord.gg/seu-servidor)

---

**Status**: ✅ 100% Funcional  
**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0
