import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, RefreshCw, X } from "lucide-react";

interface PhotoUploaderProps {
  photoUrl?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  isUploading: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Componente unificado para la subida de fotos.
 * Encapsula la lógica del input file oculto y el estado de carga.
 */
export const PhotoUploader = ({
  photoUrl,
  onUpload,
  onRemove,
  isUploading,
  disabled,
  className = "",
  size = "md"
}: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const imgSizeClass = size === "sm" ? "w-10 h-10" : size === "md" ? "w-12 h-12" : "w-16 h-16";

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {photoUrl ? (
        <div className="relative group">
          <img
            src={photoUrl}
            alt="Foto"
            className={`${imgSizeClass} rounded object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border`}
            onClick={() => !disabled && fileInputRef.current?.click()}
          />
          {!disabled && onRemove && (
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <Button
          size="icon"
          variant="outline"
          className={imgSizeClass}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </Button>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};
