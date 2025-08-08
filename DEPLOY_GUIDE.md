# Deploy Full Stack na Vercel + GitHub Pages

## 🎯 **Estratégia Recomendada:**

### Backend na Vercel (Automático)
- **URL**: `https://aicodegen-backend-paulohenriquejr.vercel.app`
- **Deploy**: Automático quando você faz push para `main`
- **Configuração**: Vercel detecta mudanças em `apps/server/`

### Frontend no GitHub Pages 
- **URL**: `https://paulohenriquejr.github.io/aicodegen`
- **Deploy**: GitHub Actions (já configurado)
- **Configuração**: Automática via workflow

## 🔧 **Configuração na Vercel:**

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub `aicodegen`

### 2. Configurar Backend
1. **Project Name**: `aicodegen-backend`
2. **Framework Preset**: Other
3. **Root Directory**: `apps/server`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm ci`

### 3. Variáveis de Ambiente no Backend
Configure no dashboard da Vercel:
- `NODE_ENV` = `production`
- `DATABASE_URL` = sua URL do banco (se usar)
- `GOOGLE_CLIENT_SECRET` = seu client secret do Google

### 4. Configurar Frontend (Opcional - se quiser na Vercel também)
1. **Project Name**: `aicodegen-frontend`  
2. **Framework Preset**: Vite
3. **Root Directory**: `apps/web`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

## 🚀 **Deploy Automático:**

### Quando você faz `git push`:
1. **Vercel detecta mudanças** em `apps/server/` e faz deploy do backend
2. **GitHub Actions roda** e faz deploy do frontend no GitHub Pages
3. **Frontend se conecta** ao backend via `https://aicodegen-backend-paulohenriquejr.vercel.app`

## ✅ **Vantagens dessa configuração:**
- ✅ Backend na Vercel (mais robusto para APIs)
- ✅ Frontend no GitHub Pages (gratuito, CDN global)
- ✅ Deploy automático para ambos
- ✅ URLs separadas e otimizadas
- ✅ Não interfere entre si

## 🔧 **URLs Finais:**
- **Frontend**: https://paulohenriquejr.github.io/aicodegen
- **Backend**: https://aicodegen-backend-paulohenriquejr.vercel.app
- **API**: https://aicodegen-backend-paulohenriquejr.vercel.app/api/

## 📝 **Próximos Passos:**
1. Faça commit das alterações
2. Configure o backend na Vercel
3. Teste o deploy completo
