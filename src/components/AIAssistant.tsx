import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Loader2, Sparkles, MessageSquare, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  eventId?: string;
}

export default function AIAssistant({ eventId }: AIAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  // Estado para controlar si el asistente está abierto o cerrado.
  const [isOpen, setIsOpen] = useState(false);
  // Almacena el historial de mensajes de la conversación.
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA para este evento. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  // Almacena el texto actual del input del usuario.
  const [input, setInput] = useState("");
  // Indica si se está esperando una respuesta del asistente de IA.
  const [isLoading, setIsLoading] = useState(false);
  // Referencia para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Referencia para hacer scroll automático al final de la conversación.
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Maneja el envío de mensajes al asistente de IA.
  const sendMessage = async () => {
    // No enviar si el input está vacío, ya está cargando o el usuario no está autenticado.
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { role: "user", content: input };
    // Añade el mensaje del usuario al historial.
    setMessages(prev => [...prev, userMessage]);
    // Limpia el input.
    setInput("");
    // Activa el estado de carga.
    setIsLoading(true);

    let assistantContent = "";

    try {
      // Realiza la llamada a la función de Supabase que integra con el motor de IA.
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          // Envía el historial completo de mensajes para mantener el contexto.
          messages: [...messages, userMessage],
          userId: user.id,
          eventId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al conectar con el asistente");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("AI error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar tu mensaje",
      });
      // Remove the empty assistant message if there was an error
      if (assistantContent === "") {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Maneja la subida y análisis de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { 
      role: "user", 
      content: `📎 Analizando archivo: ${file.name}` 
    }]);

    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `ai-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('event-files')
        .getPublicUrl(filePath);

      // Llamar a la Edge Function de análisis
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-file-analyzer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: fileExt,
          eventId,
        }),
      });

      if (!response.ok) throw new Error("Error al analizar el archivo");

      const data = await response.json();
      
      const analysisMessage = `✅ He analizado "${file.name}". Encontré ${data.itemsFound || 0} elementos.\n\n` +
        `${data.extractedData.beverages ? `🍷 Bebidas: ${data.extractedData.beverages.length}\n` : ''}` +
        `${data.extractedData.menuItems ? `🍽️ Platos: ${data.extractedData.menuItems.length}\n` : ''}` +
        `${data.extractedData.staff ? `👥 Personal: ${data.extractedData.staff.length}\n` : ''}` +
        `\n¿Quieres que añada estos datos al evento?`;

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: analysisMessage 
      }]);

    } catch (error) {
      console.error("Error analyzing file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pude analizar el archivo. Inténtalo de nuevo.",
      });
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Lo siento, hubo un error al analizar el archivo." 
      }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const suggestions = [
    "¿Cuántas bebidas necesito para 150 invitados?",
    "Genera una lista de bebidas para mi evento",
    "Crea un menú típico para este evento",
    "Calcula el personal necesario",
  ];

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
          Asistente IA Gula
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
                ¡Hola! Soy tu asistente de Gula Catering. Puedo ayudarte con consultas sobre eventos, calcular cantidades, buscar eventos similares y más.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Sugerencias:</p>
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 text-xs"
                    onClick={() => {
                      setInput(suggestion);
                    }}
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
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta o sube un archivo..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Puedes subir PDFs, Excel o imágenes para analizarlos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
