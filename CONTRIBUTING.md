# 🤝 Guia de Contribuição - AICodeGen

Obrigado pelo seu interesse em contribuir com o **AICodeGen**! Este documento fornece diretrizes e informações para ajudar você a contribuir de forma efetiva.

## 🎯 Como Contribuir

### 🐛 Reportando Bugs

Antes de criar uma issue, verifique se o bug já foi reportado:

1. Pesquise nas [issues existentes](https://github.com/seu-usuario/aicodegen/issues)
2. Se não encontrar, crie uma nova issue usando o template de bug report
3. Inclua informações detalhadas:
   - Versão do Node.js
   - Sistema operacional
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)

### ✨ Sugerindo Melhorias

Para sugerir novas funcionalidades:

1. Verifique se a funcionalidade já foi sugerida
2. Crie uma issue usando o template de feature request
3. Descreva claramente:
   - O problema que a funcionalidade resolve
   - A solução proposta
   - Alternativas consideradas
   - Impacto nos usuários

### 🔧 Contribuindo com Código

#### Configuração do Ambiente

```bash
# 1. Fork e clone o repositório
git clone https://github.com/seu-usuario/aicodegen.git
cd aicodegen

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp apps/server/.env.example apps/server/.env
# Edite o arquivo .env com suas configurações

# 4. Execute o projeto
npm run dev
```

#### Fluxo de Desenvolvimento

1. **Crie uma branch** para sua funcionalidade:
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Faça suas alterações** seguindo os padrões do projeto

3. **Teste suas alterações**:
   ```bash
   npm run check-types
   npm run build
   ```

4. **Commit suas mudanças** usando Conventional Commits:
   ```bash
   git commit -m "feat: adicionar nova funcionalidade"
   ```

5. **Push para sua branch**:
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```

6. **Abra um Pull Request** com descrição detalhada

## 📝 Padrões de Código

### TypeScript

- Use TypeScript em todos os arquivos
- Evite `any` - prefira tipagem explícita
- Use interfaces para objetos complexos
- Documente funções públicas com JSDoc

```typescript
/**
 * Gera um componente React baseado no prompt
 * @param prompt - Descrição do componente desejado
 * @param options - Opções de configuração
 * @returns Código do componente gerado
 */
const generateComponent = async (
  prompt: string, 
  options: GenerationOptions
): Promise<ComponentCode> => {
  // implementação
};
```

### React

- Use function components com hooks
- Prefira arrow functions para componentes
- Use TypeScript interfaces para props
- Implemente error boundaries quando necessário

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Tailwind CSS

- Use classes de utilitário do Tailwind
- Evite CSS customizado
- Use responsive design (mobile-first)
- Prefira classes semânticas para componentes reutilizáveis

```tsx
// ✅ Bom
<div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg shadow-lg">

// ❌ Evite
<div style={{ display: 'flex', padding: '24px' }}>
```

## 🧪 Testes

### Executando Testes

```bash
# Verificação de tipos
npm run check-types

# Build do projeto
npm run build

# Linting
npm run lint
```

### Escrevendo Testes

- Adicione testes para novas funcionalidades
- Use Jest e React Testing Library
- Teste casos de sucesso e falha
- Mantenha cobertura de código alta

```typescript
// Exemplo de teste
describe('generateComponent', () => {
  it('should generate a valid React component', async () => {
    const result = await generateComponent('button component');
    expect(result).toMatchObject({
      name: expect.stringMatching(/^[A-Z]/),
      code: expect.stringContaining('function'),
    });
  });
});
```

## 📚 Documentação

### Atualizando Documentação

- Mantenha o README.md atualizado
- Documente novas APIs no código
- Adicione exemplos de uso
- Atualize o CHANGELOG.md

### Escrevendo Documentação

- Use linguagem clara e concisa
- Inclua exemplos práticos
- Adicione screenshots quando relevante
- Mantenha consistência no estilo

## 🎨 Design e UX

### Princípios de Design

- **Simplicidade**: Interface limpa e intuitiva
- **Consistência**: Padrões visuais coerentes
- **Acessibilidade**: Suporte a leitores de tela
- **Performance**: Carregamento rápido e responsivo

### Componentes UI

- Use componentes do shadcn/ui
- Mantenha design system consistente
- Teste em diferentes dispositivos
- Implemente dark mode quando aplicável

## 🔄 Processo de Review

### Para Contribuidores

- Descreva claramente as mudanças no PR
- Inclua screenshots para mudanças de UI
- Responda aos comentários de review
- Mantenha o PR focado e pequeno

### Para Reviewers

- Seja construtivo nos comentários
- Teste as mudanças localmente
- Verifique se a documentação foi atualizada
- Aprove apenas se tudo estiver correto

## 🌟 Áreas Prioritárias

### High Priority

- [ ] Integração com mais modelos de IA
- [ ] Testes automatizados (Jest, Cypress)
- [ ] Performance e otimizações
- [ ] Documentação e tutoriais

### Medium Priority

- [ ] Suporte a Vue e Angular
- [ ] Integração com Figma API
- [ ] Sistema de plugins
- [ ] Internacionalização (i18n)

### Low Priority

- [ ] Temas customizáveis
- [ ] Modo offline
- [ ] Analytics e métricas
- [ ] Integração com outras ferramentas

## 📞 Suporte

### Canais de Comunicação

- **GitHub Issues**: Para bugs e feature requests
- **GitHub Discussions**: Para perguntas gerais
- **Discord**: Para chat em tempo real (em breve)
- **Email**: contato@aicodegen.dev (em breve)

### Respondendo Perguntas

- Seja paciente e respeitoso
- Forneça exemplos práticos
- Direcione para documentação quando apropriado
- Escale para maintainers se necessário

## 🏆 Reconhecimento

Contribuidores são reconhecidos em:

- Lista de contribuidores no README
- Release notes para contribuições significativas
- Hall of Fame no site (futuro)
- Convites para beta de novas funcionalidades

## 📋 Checklist para PRs

Antes de submeter um PR, verifique:

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passando (`npm run check-types`)
- [ ] Build funcionando (`npm run build`)
- [ ] Documentação atualizada
- [ ] Commit messages seguem Conventional Commits
- [ ] PR tem descrição clara
- [ ] Screenshots incluídos (se mudanças de UI)
- [ ] Não há conflitos de merge

## 🔒 Código de Conduta

Este projeto adere ao [Código de Conduta do Contributor Covenant](https://www.contributor-covenant.org/). Participando, você concorda em manter um ambiente acolhedor e respeitoso para todos.

---

**Obrigado por contribuir com o AICodeGen!** 🚀

Sua contribuição ajuda a tornar a geração de código com IA mais acessível para todos os desenvolvedores.
