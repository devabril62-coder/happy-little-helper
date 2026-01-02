import { useState } from 'react';
import { 
  Eraser, 
  Image, 
  Sparkles, 
  Copy, 
  Wand2,
  Sun,
  Moon,
  Mountain,
  Building2,
  Waves,
  TreePine,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ToolPanelProps {
  onRemoveBackground: () => void;
  onChangeScene: (prompt: string) => void;
  onChangeStyle: (prompt: string) => void;
  onGenerateVariations: (count: number, prompt?: string) => void;
  onCustomEdit: (prompt: string) => void;
  disabled?: boolean;
  hasImage: boolean;
}

const scenePresets = [
  { id: 'beach', label: 'Praia', icon: Waves, prompt: 'tropical beach with clear blue water and palm trees at sunset' },
  { id: 'forest', label: 'Floresta', icon: TreePine, prompt: 'enchanted forest with soft sunlight filtering through trees' },
  { id: 'city', label: 'Cidade', icon: Building2, prompt: 'modern city skyline at golden hour with dramatic lighting' },
  { id: 'mountain', label: 'Montanha', icon: Mountain, prompt: 'majestic mountain landscape with snow peaks and dramatic clouds' },
];

const stylePresets = [
  { id: 'cinematic', label: 'Cinema', prompt: 'cinematic color grading, dramatic lighting, film look' },
  { id: 'editorial', label: 'Editorial', prompt: 'high-fashion editorial style, professional studio lighting' },
  { id: 'vintage', label: 'Vintage', prompt: 'vintage film photography style, warm tones, film grain' },
  { id: 'minimal', label: 'Minimal', prompt: 'minimalist style, clean and modern, soft neutral tones' },
];

export function ToolPanel({
  onRemoveBackground,
  onChangeScene,
  onChangeStyle,
  onGenerateVariations,
  onCustomEdit,
  disabled,
  hasImage,
}: ToolPanelProps) {
  const [activeTab, setActiveTab] = useState<'background' | 'scene' | 'style' | 'variations' | 'custom'>('background');
  const [customScenePrompt, setCustomScenePrompt] = useState('');
  const [customStylePrompt, setCustomStylePrompt] = useState('');
  const [variationCount, setVariationCount] = useState([3]);
  const [customPrompt, setCustomPrompt] = useState('');

  const tabs = [
    { id: 'background' as const, label: 'Fundo', icon: Eraser },
    { id: 'scene' as const, label: 'Cenário', icon: Image },
    { id: 'style' as const, label: 'Estilo', icon: Sparkles },
    { id: 'variations' as const, label: 'Variações', icon: Copy },
    { id: 'custom' as const, label: 'Personalizado', icon: Wand2 },
  ];

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!hasImage}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
              !hasImage && 'opacity-50 cursor-not-allowed'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'background' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                <Eraser className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Remover Fundo</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Remove automaticamente o fundo da imagem usando IA no navegador.
              </p>
              <Button
                onClick={onRemoveBackground}
                disabled={disabled || !hasImage}
                size="lg"
                className="glow-sm"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Remover Fundo
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'scene' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cenários Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {scenePresets.map((scene) => (
                <Button
                  key={scene.id}
                  variant="outline"
                  onClick={() => onChangeScene(scene.prompt)}
                  disabled={disabled || !hasImage}
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary"
                >
                  <scene.icon className="w-5 h-5" />
                  <span className="text-xs">{scene.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Cenário Personalizado
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Descreva o novo cenário..."
                  value={customScenePrompt}
                  onChange={(e) => setCustomScenePrompt(e.target.value)}
                  disabled={disabled || !hasImage}
                />
                <Button
                  onClick={() => {
                    if (customScenePrompt.trim()) {
                      onChangeScene(customScenePrompt);
                      setCustomScenePrompt('');
                    }
                  }}
                  disabled={disabled || !hasImage || !customScenePrompt.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Estilos Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {stylePresets.map((style) => (
                <Button
                  key={style.id}
                  variant="outline"
                  onClick={() => onChangeStyle(style.prompt)}
                  disabled={disabled || !hasImage}
                  className="h-auto py-3 hover:bg-primary/10 hover:border-primary"
                >
                  <span className="text-sm">{style.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Estilo Personalizado
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Descreva o estilo desejado..."
                  value={customStylePrompt}
                  onChange={(e) => setCustomStylePrompt(e.target.value)}
                  disabled={disabled || !hasImage}
                />
                <Button
                  onClick={() => {
                    if (customStylePrompt.trim()) {
                      onChangeStyle(customStylePrompt);
                      setCustomStylePrompt('');
                    }
                  }}
                  disabled={disabled || !hasImage || !customStylePrompt.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'variations' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Quantidade de Variações
              </h3>
              <div className="space-y-4">
                <Slider
                  value={variationCount}
                  onValueChange={setVariationCount}
                  min={1}
                  max={4}
                  step={1}
                  disabled={disabled || !hasImage}
                />
                <div className="text-center text-2xl font-bold text-primary">
                  {variationCount[0]}
                </div>
              </div>
            </div>

            <Button
              onClick={() => onGenerateVariations(variationCount[0])}
              disabled={disabled || !hasImage}
              className="w-full glow-sm"
              size="lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              Gerar {variationCount[0]} Variações
            </Button>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Edição por Comando
            </h3>
            <p className="text-sm text-muted-foreground">
              Descreva em detalhes o que você quer alterar na imagem.
            </p>
            <Textarea
              placeholder="Ex: Trocar a roupa por um vestido vermelho elegante..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={disabled || !hasImage}
              rows={4}
              className="resize-none"
            />
            <Button
              onClick={() => {
                if (customPrompt.trim()) {
                  onCustomEdit(customPrompt);
                  setCustomPrompt('');
                }
              }}
              disabled={disabled || !hasImage || !customPrompt.trim()}
              className="w-full glow-sm"
              size="lg"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Aplicar Edição
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
