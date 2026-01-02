import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onUpload, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  }, [onUpload, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  }, [onUpload]);

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center w-full h-80 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group',
        isDragging 
          ? 'border-primary bg-primary/10 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-secondary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className={cn(
        'flex flex-col items-center gap-4 transition-transform duration-300',
        isDragging && 'scale-110'
      )}>
        <div className={cn(
          'p-6 rounded-2xl transition-all duration-300',
          isDragging 
            ? 'bg-primary text-primary-foreground glow' 
            : 'bg-secondary group-hover:bg-primary/20'
        )}>
          {isDragging ? (
            <ImageIcon className="w-12 h-12" />
          ) : (
            <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        
        <div className="text-center">
          <p className={cn(
            'text-lg font-medium transition-colors',
            isDragging ? 'text-primary' : 'text-foreground'
          )}>
            {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Suporta JPG, PNG, WEBP (máx. 10MB)
          </p>
        </div>
      </div>

      {/* Glow effect on drag */}
      {isDragging && (
        <div className="absolute inset-0 rounded-xl pointer-events-none animate-pulse-glow" />
      )}
    </div>
  );
}
