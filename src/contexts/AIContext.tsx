import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

/**
 * Estructura de un mensaje de la IA.
 */
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
}

/**
 * Acciones que la IA puede proponer o ejecutar.
 */
export interface AIAction {
  type: 'create_beverages' | 'create_menu' | 'calculate_staff' | 'analyze_file' | 'suggest_tables' | 'update_prices' | 'generate_proposal';
  data: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  needsConfirmation?: boolean;
}

/**
 * Sugerencias proactivas de la IA basadas en el contexto del evento.
 */
export interface AISuggestion {
  id: string;
  message: string;
  action: AIAction;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Contexto extendido del "Cerebro de Catering".
 */
export interface AICateringContext {
  recipesCount: number;
  averageRecipeMargin: number;
  globalIngredientCount: number;
  topIngredientsByCost: string[];
}

interface AIContextType {
  messages: AIMessage[];
  suggestions: AISuggestion[];
  isProcessing: boolean;
  currentEventId: string | null;
  addMessage: (role: 'user' | 'assistant', content: string, actions?: AIAction[]) => void;
  updateMessageContent: (index: number, content: string) => void;
  executeAction: (action: AIAction) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  setCurrentEventId: (eventId: string | null) => void;
  clearMessages: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, actions?: AIAction[]) => {
    const newMessage: AIMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      actions,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const updateMessageContent = useCallback((index: number, content: string) => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], content };
      }
      return updated;
    });
  }, []);

  const executeAction = useCallback(async (action: AIAction) => {
    // Esta función será implementada para ejecutar acciones específicas
    console.log('Executing action:', action);
    // TODO: Implementar lógica de ejecución de acciones
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <AIContext.Provider
      value={{
        messages,
        suggestions,
        isProcessing,
        currentEventId,
        addMessage,
        updateMessageContent,
        executeAction,
        dismissSuggestion,
        setCurrentEventId,
        clearMessages,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
