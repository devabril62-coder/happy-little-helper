import { Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onReset: () => void;
  hasImage: boolean;
}

export function Header({ onReset, hasImage }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 glow-sm">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Image Editor</h1>
          <p className="text-xs text-muted-foreground">Editor profissional com inteligência artificial</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasImage && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Nova Imagem
          </Button>
        )}
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
