import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AIProvider } from "@/contexts/AIContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { PageDecorations } from "@/components/PageDecorations";
import AIAssistant from "@/components/AIAssistant";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Carga diferida (Lazy loading) de las páginas para optimizar el bundle inicial
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const Menus = lazy(() => import("./pages/Menus"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Recipes = lazy(() => import("./pages/Recipes"));
const Ingredients = lazy(() => import("./pages/Ingredients"));
const Analytics = lazy(() => import("./pages/Analytics"));

const queryClient = new QueryClient();

/**
 * Componente principal de la aplicación.
 * Configura los proveedores de contexto, el cliente de React Query y el sistema de rutas.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AIProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <PageDecorations />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Events />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/create"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <CreateEvent />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/:id"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <EventDetail />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/:id/edit"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <CreateEvent />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/menus"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Menus />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/escandallos"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Recipes />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ingredientes"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Ingredients />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Analytics />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <AIAssistant />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AIProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
