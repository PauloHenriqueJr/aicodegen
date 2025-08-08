/**
 * Real Code Generation Service
 * Generates actual React components with responsive design
 */

interface ComponentTemplate {
  name: string;
  code: string;
  files: { name: string; content: string }[];
}

export class CodeGenerationService {
  /**
   * Generate responsive React component based on prompt
   */
  static async generateComponent(
    componentName: string,
    prompt: string,
    screenType: 'login' | 'dashboard' | 'counter' | 'todolist' | 'generic' = 'generic'
  ): Promise<ComponentTemplate> {
    
    const templates = {
      login: this.generateLoginComponent(componentName),
      dashboard: this.generateDashboardComponent(componentName),
      counter: this.generateCounterComponent(componentName),
      todolist: this.generateTodoListComponent(componentName),
      generic: this.generateGenericComponent(componentName, prompt)
    };

    return templates[screenType] || templates.generic;
  }

  /**
   * Generate Login Component (responsive)
   */
  private static generateLoginComponent(name: string): ComponentTemplate {
    const code = `import React, { useState } from 'react';

interface ${name}Props {
  onLogin?: (email: string, password: string) => void;
}

const ${name}: React.FC<${name}Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onLogin?.(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Faça seu login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Seu email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Sua senha"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Lembrar de mim
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Cadastre-se
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ${name};`;

    return {
      name,
      code,
      files: [
        { name: `${name}.tsx`, content: code },
        { name: `${name}.module.css`, content: '/* Component-specific styles if needed */' }
      ]
    };
  }

  /**
   * Generate Counter Component (responsive)
   */
  private static generateCounterComponent(name: string): ComponentTemplate {
    const code = `import React, { useState } from 'react';

interface ${name}Props {
  initialValue?: number;
  step?: number;
  min?: number;
  max?: number;
}

const ${name}: React.FC<${name}Props> = ({ 
  initialValue = 0, 
  step = 1, 
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY 
}) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    setCount(prev => Math.min(prev + step, max));
  };

  const decrement = () => {
    setCount(prev => Math.max(prev - step, min));
  };

  const reset = () => {
    setCount(initialValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Contador
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Simples e responsivo
          </p>
        </div>

        {/* Counter Display */}
        <div className="text-center mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-4">
            <div className="text-6xl sm:text-7xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {count}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Min: {min === Number.NEGATIVE_INFINITY ? '∞' : min}</span>
            <span>•</span>
            <span>Max: {max === Number.POSITIVE_INFINITY ? '∞' : max}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Main buttons */}
          <div className="flex gap-3">
            <button
              onClick={decrement}
              disabled={count <= min}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
            >
              −
            </button>
            <button
              onClick={increment}
              disabled={count >= max}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
            >
              +
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={reset}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Resetar
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Passo: {step} • Valor inicial: {initialValue}
        </div>
      </div>
    </div>
  );
};

export default ${name};`;

    return {
      name,
      code,
      files: [
        { name: `${name}.tsx`, content: code }
      ]
    };
  }

  /**
   * Generate Todo List Component (responsive)
   */
  private static generateTodoListComponent(name: string): ComponentTemplate {
    const code = `import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface ${name}Props {
  initialTasks?: Task[];
}

const ${name}: React.FC<${name}Props> = ({ initialTasks = [] }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Add task
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date()
      }]);
      setNewTask('');
    }
  };

  // Toggle task
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Clear completed
  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Lista de Tarefas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Organize suas atividades diárias
          </p>
        </div>

        {/* Add Task */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Adicione uma nova tarefa..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addTask}
              disabled={!newTask.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: 'all', label: 'Todas', count: tasks.length },
            { key: 'active', label: 'Ativas', count: activeCount },
            { key: 'completed', label: 'Concluídas', count: completedCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                filter === key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }\`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg">
                {filter === 'completed' ? 'Nenhuma tarefa concluída' :
                 filter === 'active' ? 'Nenhuma tarefa ativa' :
                 'Nenhuma tarefa adicionada'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className={\`\${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}\`}>
                        {task.text}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        {task.createdAt.toLocaleDateString('pt-BR')} às {task.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover tarefa"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {tasks.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activeCount} {activeCount === 1 ? 'tarefa ativa' : 'tarefas ativas'}
              </div>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Limpar concluídas ({completedCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${name};`;

    return {
      name,
      code,
      files: [
        { name: `${name}.tsx`, content: code }
      ]
    };
  }

  /**
   * Generate Dashboard Component (responsive)
   */
  private static generateDashboardComponent(name: string): ComponentTemplate {
    const code = `import React, { useState, useEffect } from 'react';

interface DashboardData {
  totalUsers: number;
  totalProjects: number;
  totalRevenue: number;
  growthRate: number;
}

interface ${name}Props {
  data?: DashboardData;
}

const ${name}: React.FC<${name}Props> = ({ 
  data = {
    totalUsers: 1250,
    totalProjects: 89,
    totalRevenue: 54230,
    growthRate: 12.5
  }
}) => {
  const [currentData, setCurrentData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    {
      title: 'Total de Usuários',
      value: currentData.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: '👥'
    },
    {
      title: 'Projetos Ativos',
      value: currentData.totalProjects.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: '📊'
    },
    {
      title: 'Receita Total',
      value: \`R$ \${currentData.totalRevenue.toLocaleString()}\`,
      change: '+15%',
      changeType: 'positive' as const,
      icon: '💰'
    },
    {
      title: 'Taxa de Crescimento',
      value: \`\${currentData.growthRate}%\`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: '📈'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visão geral dos seus dados
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLoading(!isLoading)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center">
                    <span className={\`text-sm font-medium \${
                      stat.changeType === 'positive' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }\`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      vs mês anterior
                    </span>
                  </div>
                </div>
                <div className="text-3xl ml-4">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Crescimento Mensal
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Gráfico de crescimento
                </p>
              </div>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição por Categoria
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Gráfico de pizza
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Atividade Recente
          </h3>
          <div className="space-y-4">
            {[
              { action: 'Novo usuário cadastrado', time: '2 min atrás', user: 'João Silva' },
              { action: 'Projeto criado', time: '5 min atrás', user: 'Maria Santos' },
              { action: 'Pagamento processado', time: '10 min atrás', user: 'Pedro Costa' },
              { action: 'Relatório gerado', time: '15 min atrás', user: 'Ana Oliveira' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.user}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ${name};`;

    return {
      name,
      code,
      files: [
        { name: `${name}.tsx`, content: code }
      ]
    };
  }

  /**
   * Generate Generic Component
   */
  private static generateGenericComponent(name: string, prompt: string): ComponentTemplate {
    const code = `import React, { useState } from 'react';

interface ${name}Props {
  title?: string;
  description?: string;
}

const ${name}: React.FC<${name}Props> = ({ 
  title = "Componente Personalizado",
  description = "${prompt}"
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Componente em Desenvolvimento
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Este componente foi gerado automaticamente baseado no seu prompt.
              Personalize conforme necessário.
            </p>
            <button
              onClick={() => setIsActive(!isActive)}
              className={\`px-6 py-3 rounded-lg font-medium transition-colors \${
                isActive 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }\`}
            >
              {isActive ? 'Ativo' : 'Ativar'}
            </button>
          </div>

          {isActive && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 text-center">
                ✅ Componente ativado com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Responsivo', description: 'Funciona em todos os dispositivos' },
            { title: 'Acessível', description: 'Segue padrões de acessibilidade' },
            { title: 'Customizável', description: 'Fácil de personalizar' },
          ].map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ${name};`;

    return {
      name,
      code,
      files: [
        { name: `${name}.tsx`, content: code }
      ]
    };
  }
}