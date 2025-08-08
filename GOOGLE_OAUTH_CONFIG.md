# Configuração do Google OAuth para GitHub Pages

## ❌ Erro Atual
```
Erro 400: origin_mismatch
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
```

## 🔧 Solução: Configurar Origens no Google Cloud Console

### 1. Acesse o Google Cloud Console
- URL: https://console.cloud.google.com/
- Selecione seu projeto

### 2. Navegue para Credentials
- Menu lateral: **APIs & Services** > **Credentials**
- Encontre o OAuth 2.0 Client ID: `207876045519-7trlg013advn4qqks8vlsp2nqbghap8d.apps.googleusercontent.com`

### 3. Edite as Origens Autorizadas
Clique no Client ID e adicione estas URLs:

#### Authorized JavaScript origins:
```
https://paulohenriquejr.github.io
```

#### Authorized redirect URIs:
```
https://paulohenriquejr.github.io/aicodegen
https://paulohenriquejr.github.io/aicodegen/login
```

### 4. Para desenvolvimento local (opcional):
Se quiser testar localmente, adicione também:

#### Authorized JavaScript origins:
```
http://localhost:3001
http://localhost:4173
```

#### Authorized redirect URIs:
```
http://localhost:3001
http://localhost:3001/login
http://localhost:4173
http://localhost:4173/login
```

## 🔄 Passo a Passo Detalhado

1. **Abra o Google Cloud Console**
2. **Selecione seu projeto** (se tiver múltiplos)
3. **No menu lateral esquerdo**, clique em "APIs & Services"
4. **Clique em "Credentials"**
5. **Na lista de credenciais**, encontre seu OAuth 2.0 Client ID
6. **Clique no nome do Client ID** para abrir a tela de edição
7. **Na seção "Authorized JavaScript origins"**, clique em "ADD URI"
8. **Digite**: `https://paulohenriquejr.github.io`
9. **Clique em "SAVE"**

## ⚠️ Importante
- As alterações podem levar alguns minutos para serem propagadas
- Teste novamente após salvar as configurações
- Certifique-se de que o domínio está escrito corretamente (sem "/" no final)

## 🔍 Verificação
Após configurar, teste o login novamente no GitHub Pages:
- URL: https://paulohenriquejr.github.io/aicodegen/login
