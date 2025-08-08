import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/sonner";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";
import { AppProvider } from "../lib/app-context";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "AICodeGen - Crie aplicações com prompts simples",
      },
      {
        name: "description",
        content: "Transforme suas ideias em aplicações React completas com designs profissionais usando inteligência artificial.",
      },
    ],
    links: [
      {
        rel: "icon",
  href: "/aicodegen/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        storageKey="aicodegen-theme"
      >
        <AppProvider>
          <div className="min-h-screen">
            <Outlet />
          </div>
          <Toaster richColors />
        </AppProvider>
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
