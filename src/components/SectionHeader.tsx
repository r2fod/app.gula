import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Calculator, RefreshCw } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  isEditing: boolean;
  isDemo: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onGenerate?: () => void;
  onRecalculate?: () => void;
  showGenerate?: boolean;
  showRecalculate?: boolean;
  totalPrice?: number;
}

/**
 * Componente de cabecera unificado para las secciones de eventos.
 * Maneja el título, subtítulo (como info de PAX), icono y estados de edición.
 */
export const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  isEditing,
  isDemo,
  onEdit,
  onSave,
  onCancel,
  onGenerate,
  onRecalculate,
  showGenerate,
  showRecalculate,
  totalPrice
}: SectionHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />}
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle}
            {totalPrice !== undefined && totalPrice > 0 && (
              <span className="ml-2 text-primary font-medium">• Total: {totalPrice.toFixed(2)}€</span>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!isEditing ? (
          <>
            {/* Botón de editar - solo visible si NO es modo demo */}
            {!isDemo && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            {/* Botón de generar - ahora visible también en modo demo */}
            {showGenerate && onGenerate && (
              <Button size="sm" variant="outline" onClick={onGenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generar automáticamente
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Botón de recalcular - solo visible durante edición */}
            {showRecalculate && onRecalculate && (
              <Button size="sm" variant="outline" onClick={onRecalculate} title="Recalcular según PAX sin guardar">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalcular
              </Button>
            )}
            <Button size="sm" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};