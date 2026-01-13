import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Loader2, Sparkles, MessageSquare, Paperclip } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { useAIChat } from "@/hooks/useAIChat";

interface AIAssistantProps {
  eventId?: string;
}

/**
 * Componente de interfaz para el Asistente de IA.
 * Utiliza el hook useAIChat para comunicarse con el "Master Brain" de Gula.
 */
export default function AIAssistant({ eventId }: AIAssistantProps) {
  const { user } = useAuth();
  const { messages, updateMessageContent } = useAI();
  const { sendMessage, uploadAndAnalyzeFile, loading } = useAIChat(eventId);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automático al recibir nuevos mensajes o actualizaciones de streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /**
   * Gestiona el envío de mensajes a través del hook unificado.
   */
  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userQuery = input;
    const currentMessageIndex = messages.length;
    setInput("");

    // Llamada con streaming activado para el chat fluido
    await sendMessage(userQuery, {
      stream: true,
      onStreamUpdate: (text) => {
        // Actualizamos el mensaje del asistente (índice currentMessageIndex + 1 porque userQuery acaba de ser añadido)
        updateMessageContent(currentMessageIndex + 1, text);
      }
    });
  };

  /**
   * Gestiona la subida y análisis de archivos externos.
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    await uploadAndAnalyzeFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Genera sugerencias contextuales basadas en la página donde se encuentra el usuario.
   */
  const getContextualSuggestions = () => {
    const path = window.location.pathname;

    if (path.includes('/escandallos')) {
      return [
        "¿Cómo puedo mejorar el margen de este plato?",
        "Calcula el coste total de mis recetas",
        "Busca ingredientes con precio alto",
        "Sugiéreme un precio de venta para un margen del 70%",
      ];
    }

    if (path.includes('/events')) {
      return [
        "¿Cuántas bebidas necesito para 150 invitados?",
        "Genera una lista de personal para una boda",
        "Busca eventos similares al de la semana que viene",
        "Calcula el presupuesto estimado de mi próximo evento",
      ];
    }

    if (path.includes('/menus')) {
      return [
        "Crea un menú de gala para 50 personas",
        "Sugiéreme platos para un cóctel de pie",
        "Verifica alergias comunes en mis platos",
        "Añade un postre de chocolate a este menú",
      ];
    }

    if (path.includes('/ingredientes')) {
      return [
        "¿Cuáles son los 5 ingredientes más caros?",
        "Busca ingredientes sin stock",
        "Analiza la variación de precios este mes",
        "¿Qué proveedor tiene más ingredientes?",
      ];
    }

    if (path.includes('/analytics')) {
      return [
        "¿Por qué el margen de este evento fue bajo?",
        "Analiza el coste de personal este mes",
        "¿Cómo puedo compensar pérdidas en el próximo evento?",
        "Sugiéreme mejoras de rentabilidad",
      ];
    }

    return [
      "¿Cómo puedo ayudarte hoy?",
      "Dime un resumen de mis próximos eventos",
      "¿Cuál es mi plato más rentable?",
      "Ayúdame a planificar la semana",
    ];
  };

  const suggestions = getContextualSuggestions();

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 h-[500px] max-h-[calc(100vh-2rem)] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Cerebro Gula
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground hover:bg-primary/80">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                ¡Hola! Soy el cerebro inteligente de Gula. Puedo ayudarte con eventos, escandallos y planificación proactiva.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Sugerencias:</p>
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 text-xs"
                    onClick={() => setInput(suggestion)}
                  >
                    <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted shadow-sm"
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.actions.map((action: any, idx: number) => (
                          <div key={idx} className="p-2 bg-background/50 rounded border text-xs flex items-center justify-between">
                            <span>Acción: {action.type}</span>
                            <Button size="sm" variant="secondary" className="h-6 text-[10px]">Ejecutar</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
