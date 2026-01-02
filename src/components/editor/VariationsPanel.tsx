import { Check, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VariationsPanelProps {
  variations: string[];
  onSelect: (index: number) => void;
  onDownload: (index: number) => void;
  onClose: () => void;
}

export function VariationsPanel({
  variations,
  onSelect,
  onDownload,
  onClose,
}: VariationsPanelProps) {
  if (variations.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-xl border border-border p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto editor-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Variações Geradas</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {variations.map((variation, index) => (
            <div
              key={index}
              className="group relative rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
            >
              <img
                src={variation}
                alt={`Variação ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
              
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onSelect(index)}
                  className="glow-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Usar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(index)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-medium">
                Variação {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
