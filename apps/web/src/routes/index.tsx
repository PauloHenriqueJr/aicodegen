import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Code, Figma, Zap, Sparkles, Check, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { useApp } from "../lib/app-context";
import { ModeToggle } from "../components/mode-toggle";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { isAuthenticated } = useApp();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleTryNow = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    if (!isAuthenticated) {
      sessionStorage.setItem("pendingPrompt", trimmed);
      router.navigate({ to: "/login" });
      return;
    }

    router.navigate({ to: "/dashboard", search: { project: trimmed } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AICodeGen
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <a href="#recursos" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Recursos</a>
          <a href="#precos" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Preços</a>
          <a href="#documentacao" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Documentação</a>
          <a href="#suporte" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Suporte</a>
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <ModeToggle />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Potencializado por IA
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Crie aplicações{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              com prompts simples
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transforme suas ideias em aplicações React completas com designs profissionais.
            Nossa plataforma combina poder da IA com código production-ready em segundos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg shadow-blue-600/20">
                Começar Gratuitamente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#experimente" className="px-8">
              <Button variant="outline" size="lg" className="px-8">
                Ver Demo
              </Button>
            </a>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Comece grátis com 50 créditos • Sem cartão de crédito necessário
          </p>
        </motion.div>

      </section>

      {/* Try Now - Central Chat */}
      <section id="experimente" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl bg-white/80 dark:bg-gray-950/70 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl"
        >
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Experimente agora</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Descreva sua aplicação e veja como funciona na prática.</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Dashboard de e-commerce com gráficos"
                  className="h-16 text-lg px-6 pr-32 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 shadow-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Button onClick={handleTryNow} disabled={!prompt.trim()} className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-lg">
                    <Send className="w-5 h-5 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">💡 Dica: comece com um objetivo claro</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "App de tarefas com colaboração e tema escuro",
                    "Dashboard de vendas com gráficos interativos",
                    "Landing page para startup de tecnologia",
                    "Sistema de gestão de usuários"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tudo que você precisa para{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              criar aplicações incríveis
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Nossa plataforma combina as melhores ferramentas de desenvolvimento para entregar resultados profissionais em tempo recorde.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Code,
              title: "Código React",
              description: "Componentes React completos com TypeScript, Tailwind e melhores práticas."
            },
            {
              icon: Figma,
              title: "Designs no Figma",
              description: "Frames do Figma gerados automaticamente para cada tela da sua aplicação."
            },
            {
              icon: Zap,
              title: "Deploy Rápido",
              description: "Código production-ready que você pode baixar e fazer deploy imediatamente."
            },
            {
              icon: Sparkles,
              title: "Componentes Inteligentes",
              description: "Componentes responsivos, acessíveis e otimizados para performance."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-2xl shadow-md transition-all duration-300 hover:-translate-y-1 bg-card/90 backdrop-blur border border-border">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-16 text-white text-center shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-blue-100">Apps criados</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-blue-100">Desenvolvedores</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">2s</div>
              <div className="text-blue-100">Tempo médio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha o plano ideal{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              para suas necessidades
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Comece gratuitamente e escale conforme suas necessidades. Todos os planos incluem recursos premium.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Gratuito",
              price: "R$ 0",
              period: "",
              description: "Para experimentar e projetos pessoais",
              features: [
                "50 créditos por mês",
                "Modelos básicos de IA",
                "Até 3 projetos",
                "Suporte por email",
                "Exportação de código"
              ],
              cta: "Começar Grátis"
            },
            {
              name: "Pro",
              price: "R$ 49",
              period: "/mês",
              description: "Para desenvolvedores profissionais",
              features: [
                "500 créditos por mês",
                "Todos os modelos de IA",
                "Projetos ilimitados",
                "Suporte prioritário",
                "Figma e código",
                "Colaboração em equipe"
              ],
              cta: "Escolher Pro",
              popular: true
            },
            {
              name: "Enterprise",
              price: "R$ 199",
              period: "/mês",
              description: "Para equipes e grandes projetos",
              features: [
                "Créditos ilimitados",
                "Modelos customizados",
                "SSO e segurança avançada",
                "Suporte dedicado",
                "API personalizada",
                "SLA garantido"
              ],
              cta: "Falar com Vendas"
            }
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`${plan.popular ? 'ring-2 ring-blue-600 relative' : ''} p-6 h-full hover:shadow-2xl transition-shadow bg-card/90 backdrop-blur border border-border`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-300">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/login">
                  <Button 
                    className={`w-full ${plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                      : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Dúvidas sobre os planos?</p>
          <Button variant="link" className="text-blue-600 dark:text-blue-400">
            Ver FAQ Completo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AICodeGen</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando ideias em aplicações completas com o poder da inteligência artificial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Changelog</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#documentacao" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Exemplos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#suporte" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Comunidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AICodeGen. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Termos</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
